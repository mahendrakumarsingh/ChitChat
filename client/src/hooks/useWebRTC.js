import { useState, useRef, useCallback, useEffect } from 'react';

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = (socketRef, currentUserId, currentUserName, onCallLog) => {
    const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'incoming', 'connected'
    const [caller, setCaller] = useState(null); // When incoming call: { id, name, isVideo }
    const [receiverItem, setReceiverItem] = useState(null); // When we initiate call: { id }
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [facingMode, setFacingMode] = useState('user');

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const [callDuration, setCallDuration] = useState(0);
    const callDurationRef = useRef(0);
    const timerRef = useRef(null);

    const pcRef = useRef(null);
    const localStreamRef = useRef(null);

    // Timer effect for connected state
    useEffect(() => {
        if (callState === 'connected') {
            callDurationRef.current = 0;
            setCallDuration(0);
            timerRef.current = setInterval(() => {
                callDurationRef.current += 1;
                setCallDuration(callDurationRef.current);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [callState]);

    const emit = (event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    };

    const cleanup = useCallback(() => {
        console.log('[WebRTC] Cleaning up...');
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setCallState('idle');
        setCaller(null);
        setReceiverItem(null);
        setIsVideoCall(false);
        setFacingMode('user');
        setCallDuration(0);
        callDurationRef.current = 0;
    }, []);

    const createPeerConnection = useCallback((otherUserId) => {
        console.log('[WebRTC] Creating peer connection for:', otherUserId);
        const pc = new RTCPeerConnection(configuration);
        pcRef.current = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.ontrack = (event) => {
            console.log('[WebRTC] Received remote track');
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emit('webrtc:ice-candidate', {
                    candidate: event.candidate,
                    receiverId: otherUserId,
                    senderId: currentUserId,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                cleanup();
            }
        };

        return pc;
    }, [currentUserId, cleanup]);

    const initMediaAndCall = async (receiverId, isVideo, receiverName) => {
        try {
            console.log('[WebRTC] initMediaAndCall called with receiverId:', receiverId, 'isVideo:', isVideo);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo ? { facingMode: 'user' } : false,
                audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            setIsVideoCall(isVideo);
            setReceiverItem({ id: receiverId, name: receiverName });
            setCallState('calling');

            console.log('[WebRTC] Initiating call to:', receiverId);
            emit('call:initiate', {
                callerId: currentUserId,
                callerName: currentUserName,
                receiverId,
                isVideo,
            });
        } catch (error) {
            console.error('Error accessing media devices.', error);
            alert('Could not access microphone/camera');
        }
    };

    const answerCall = async () => {
        if (!caller) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: caller.isVideo ? { facingMode: 'user' } : false,
                audio: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);

            emit('call:accept', {
                callerId: caller.id,
                receiverId: currentUserId,
            });

            const pc = createPeerConnection(caller.id);
            setCallState('connected');
        } catch (error) {
            console.error('Error answering call', error);
            rejectCall();
        }
    };

    const rejectCall = () => {
        if (caller) {
            emit('call:reject', {
                callerId: caller.id,
                receiverId: currentUserId,
            });
        }
        cleanup();
    };

    const endCall = () => {
        const otherUserId = callState === 'incoming' && caller ? caller.id :
            callState === 'calling' && receiverItem ? receiverItem.id :
                callState === 'connected' ? (caller?.id || receiverItem?.id) : null;
        if (otherUserId) {
            emit('call:end', {
                userId: currentUserId,
                otherUserId,
            });
            // If we are the caller and hanging up during calling/ringing, log Missed Call
            // Or if connected, track it.
            if (receiverItem) { // We are the caller
                const isMissed = callState !== 'connected';
                if (onCallLog) {
                    onCallLog({
                        receiverId: receiverItem.id,
                        isVideo: isVideoCall,
                        isMissed,
                        duration: callDurationRef.current
                    });
                }
            }
        }
        cleanup();
    };

    const flipCamera = async () => {
        if (!isVideoCall || !localStreamRef.current) return;

        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
            });

            const newVideoTrack = stream.getVideoTracks()[0];

            if (pcRef.current) {
                const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            }

            localStreamRef.current.getVideoTracks().forEach(track => track.stop());

            const newLocalStream = new MediaStream([
                ...localStreamRef.current.getAudioTracks(),
                newVideoTrack
            ]);

            localStreamRef.current = newLocalStream;
            setLocalStream(newLocalStream);
            setFacingMode(newFacingMode);
        } catch (error) {
            console.error('Error flipping camera', error);
        }
    };

    // Socket Handlers
    const handleCallIncoming = useCallback(({ callerId, callerName, isVideo }) => {
        console.log('[WebRTC] handleCallIncoming triggered', { callerId, callerName, isVideo });
        console.log('[WebRTC] Incoming call from', callerName);
        setCaller({ id: callerId, name: callerName, isVideo });
        setIsVideoCall(isVideo);
        setCallState('incoming');
    }, []);

    const handleCallAccepted = useCallback(async ({ receiverId }) => {
        console.log('[WebRTC] Call accepted by', receiverId);
        setCallState('connected');
        const pc = createPeerConnection(receiverId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        emit('webrtc:offer', {
            offer,
            receiverId,
            callerId: currentUserId,
        });
    }, [createPeerConnection, currentUserId]);

    const handleCallRejected = useCallback((data) => {
        console.log('[WebRTC] Call rejected', data?.reason ? `(Reason: ${data.reason})` : '');
        if (data?.reason === 'offline') {
            // Optional: you can show a toast instead of an alert
            // alert('The user is currently offline or unreachable.');
        } else {
            // Optional: show a toast
            // alert('Call was rejected');
        }
        // Log missed call
        if (receiverItem && onCallLog) {
            onCallLog({
                receiverId: receiverItem.id,
                isVideo: isVideoCall,
                isMissed: true,
                duration: 0
            });
        }
        cleanup();
    }, [cleanup, receiverItem, isVideoCall, onCallLog]);

    const handleCallEnded = useCallback(() => {
        console.log('[WebRTC] Call ended by other user');
        if (receiverItem && onCallLog) {
            onCallLog({
                receiverId: receiverItem.id,
                isVideo: isVideoCall,
                isMissed: callState !== 'connected',
                duration: callDurationRef.current
            });
        }
        cleanup();
    }, [cleanup, receiverItem, isVideoCall, callState, onCallLog]);

    const handleWebRTCOffer = useCallback(async ({ offer, callerId }) => {
        if (!pcRef.current) {
            console.log('[WebRTC] Creating peer connection for incoming offer');
            createPeerConnection(callerId);
        }
        const pc = pcRef.current;

        // We only create connection upon answering, so if we're here, we must be in 'connected' state
        if (pc.signalingState !== 'stable') {
            console.warn('[WebRTC] Signaling state is not stable, state is:', pc.signalingState);
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            emit('webrtc:answer', {
                answer,
                receiverId: callerId,
                callerId: currentUserId,
            });
        } catch (err) {
            console.error('[WebRTC] Error handling offer:', err);
        }
    }, [createPeerConnection, currentUserId]);

    const handleWebRTCAnswer = useCallback(async ({ answer }) => {
        try {
            if (pcRef.current) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (err) {
            console.error('[WebRTC] Error setting remote description from answer', err);
        }
    }, []);

    const handleWebRTCIceCandidate = useCallback(async ({ candidate }) => {
        try {
            if (pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (err) {
            console.error('[WebRTC] Error adding ICE candidate', err);
        }
    }, []);

    return {
        callState,
        caller,
        receiverItem,
        isVideoCall,
        localStream,
        remoteStream,
        callDuration,
        initMediaAndCall,
        answerCall,
        rejectCall,
        endCall,
        flipCamera,

        // socket event handlers mapped
        socketHandlers: {
            onCallIncoming: handleCallIncoming,
            onCallAccepted: handleCallAccepted,
            onCallRejected: handleCallRejected,
            onCallEnded: handleCallEnded,
            onWebRTCOffer: handleWebRTCOffer,
            onWebRTCAnswer: handleWebRTCAnswer,
            onWebRTCIceCandidate: handleWebRTCIceCandidate,
        },
    };
};
