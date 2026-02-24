import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Maximize, Minimize, SwitchCamera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRef, useEffect, useState } from 'react';

export const CallModal = ({
    callState,
    caller,
    receiverItem,
    isVideoCall,
    localStream,
    remoteStream,
    callDuration,
    onAccept,
    onReject,
    onEnd,
    onFlipCamera,
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    useEffect(() => {
        let ringtone = null;
        if (callState === 'incoming' || callState === 'calling') {
            ringtone = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg');
            ringtone.loop = true;
            const playPromise = ringtone.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => console.log('Ringtone blocked usually because of browser auto-play policy:', err));
            }
        }

        return () => {
            if (ringtone) {
                ringtone.pause();
                ringtone.currentTime = 0;
            }
        };
    }, [callState]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    if (callState === 'idle') return null;

    console.log('Rendering CallModal with callState:', callState);

    const getDialingName = () => {
        if (callState === 'incoming') return caller?.name || 'Someone';
        if (callState === 'calling' || callState === 'connected') return caller?.name || receiverItem?.name || 'User';
        return '';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`relative bg-[var(--surface)] border border-[var(--surface-light)] overflow-hidden shadow-2xl transition-all duration-300 ${(callState === 'connected' || callState === 'calling') && isVideoCall ? (isFullscreen ? 'w-screen h-screen border-none rounded-none' : 'w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] rounded-2xl') : 'w-[90vw] max-w-sm rounded-2xl'}`}>

                {/* Header - Call Status */}
                <div className="absolute top-4 left-0 right-0 z-10 flex flex-col items-center justify-center p-4 transition-all duration-300">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">{getDialingName()}</h2>
                    <p className="text-sm text-white/80 drop-shadow-md mt-1 font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {callState === 'incoming' ? (isVideoCall ? 'Incoming Video Call...' : 'Incoming Audio Call...') :
                            callState === 'calling' ? 'Calling...' :
                                callState === 'connected' ? formatDuration(callDuration) : ''}
                    </p>
                </div>

                {/* Top Right Controls */}
                {(callState === 'connected' || callState === 'calling') && isVideoCall && (
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                        <button
                            onClick={toggleFullscreen}
                            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-md transition-colors shadow-lg"
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onFlipCamera}
                            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-md transition-colors shadow-lg"
                        >
                            <SwitchCamera className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Media Area */}
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 min-h-[300px]">
                    {/* Audio Call Avatar */}
                    {(!isVideoCall || callState !== 'connected') && (
                        <div className="flex flex-col items-center animate-pulse">
                            <Avatar className="w-32 h-32 border-4 border-[var(--surface)] shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getDialingName()}`} />
                                <AvatarFallback className="bg-[var(--electric-blue)] text-white text-4xl">{getDialingName()?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    {/* Remote Video */}
                    {isVideoCall && callState === 'connected' && (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Remote Audio (for Audio-only calls) */}
                    {!isVideoCall && callState === 'connected' && (
                        <audio
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="hidden"
                        />
                    )}

                    {/* Local Video Thumbnail */}
                    {isVideoCall && (callState === 'connected' || callState === 'calling') && (
                        <div className="absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-64 bg-black rounded-lg overflow-hidden shadow-xl border-2 border-[var(--surface-light)]">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6">

                    {callState === 'incoming' ? (
                        <>
                            <button
                                onClick={onReject}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onAccept}
                                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 animate-bounce"
                            >
                                {isVideoCall ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {isVideoCall && (
                                <button
                                    onClick={toggleVideo}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                                >
                                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                </button>
                            )}

                            <button
                                onClick={onEnd}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
