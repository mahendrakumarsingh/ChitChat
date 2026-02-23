# Call Signaling Debugging Guide

This guide helps diagnose and fix call signaling issues where receivers don't get incoming call notifications.

## Problem Symptoms

- Caller sees "Ringing" status ✅
- Receiver sees no incoming call notification ❌
- No console errors visible
- Call never connects

## Testing & Debugging Steps

### 1. **Check Server Debug Log**

The server logs all signaling events to `server/server_debug.txt`.

Run your server and initiate a call, then check for:

```bash
# On Windows
type server/server_debug.txt | tail -30

# On Mac/Linux
tail -30 server/server_debug.txt
```

**Expected output pattern:**
```
[TIMESTAMP] ===== CALL:INITIATE ===== Caller: user1, Receiver: user2, Video: false
[TIMESTAMP] Available users: [user1, user2]
[TIMESTAMP] Receiver user2 has 1 socket(s)
[TIMESTAMP] Emitting call:incoming to receiver user2
[TIMESTAMP] emitToUser: event=call:incoming, userId=user2, socketCount=1, availableKeys=[user1, user2]
[TIMESTAMP] Sending call:incoming to socket [socket-id]
```

### 2. **Check Browser Console (Receiver Side)**

Open the receiver's browser console and look for:

```javascript
// Expected console logs:
[useSocket] call:incoming received: {callerId: "user1", callerName: "User 1", ...}
[WebRTC] handleCallIncoming triggered {callerId: "user1", ...}
[App] onCallIncoming handler triggered with data: {...}
```

### 3. **Check Browser Console (Caller Side)**

```javascript
// Expected logs:
[WebRTC] initMediaAndCall called with receiverId: user2, isVideo: false
[WebRTC] Initiating call to: user2
```

## Key Issue: Socket Event Listener Attachment

**How it works:** The socket listeners are attached once when useSocket connects. Event handlers are dynamically resolved through `eventsRef` which is updated whenever the `events` prop changes.

**Debug verification via Network tab:**

1. Open DevTools → Network → WS (WebSocket) tab
2. Click on the socket.io connection
3. Go to "Frames" tab
4. Trigger a call
5. You should see:
   ```
   call:initiate (sent from caller)
   call:incoming (received by receiver)
   ```

## Common Issues & Fixes

### Issue 1: "Receiver has 0 socket(s)"

**Problem:** Receiver is not registered as online.

**Cause:** User didn't emit `user:online` event or socket disconnected.

**Fix:**
1. Check both users see each other as online (presence status)
2. In receiver browser console, look for:
   ```
   Socket connected: [socket-id]
   ```
3. If not present, socket connection failed - check Network tab for connection errors

### Issue 2: Event reaches server but not receiver

**Problem:** Server debug log shows "Emitting call:incoming" but receiver doesn't get it.

**Cause:** Socket ID mapping issue or receiver socket disconnected after coming online.

**Check:**
```
Server log should show:
[timestamp] Receiver user2 has 1 socket(s)
[timestamp] Sending call:incoming to socket [socket-abc123]
```

**Fix:**
1. Verify receiver socket ID matches server registration
2. Check Network tab - WebSocket should still be connected
3. Look for disconnect events in server log

### Issue 3: Event received but no dialog shows

**Problem:** Socket message reaches receiver but UI doesn't update.

**Cause:** 
- Handler is not properly updating React state
- CallModal not rendering when `callState === 'incoming'`
- Event handler reference is stale

**Fix:**
1. Check `useWebRTC` state updates:
   - Browser Console (Receiver): `[WebRTC] handleCallIncoming triggered`
   - If NOT shown: event listener isn't invoking the handler
   
2. Verify CallModal component:
   ```javascript
   // In browser DevTools Console
   document.querySelector('*')  // Search for "Ringing" text
   ```
   Should find call modal, or check if it's conditionally not rendering

3. Check React state:
   ```javascript
   // If you have React DevTools installed
   // Look at CallModal props: callState (should be 'incoming')
   ```

### Issue 4: Multiple socket connections

**Problem:** User receives multiple notifications or old socket ID is still registered.

**Check in server log:**
```
[timestamp1] Registered user1 to socket [socket-1]. Total: 1
[timestamp2] Registered user1 to socket [socket-2]. Total: 2  // ⚠️ Should stay 1
```

**Fix:**
- Check for duplicate browser tabs
- Hard refresh browser (Ctrl+Shift+R)
- Close all app instances and restart
- Check for multiple app windows

### Issue 5: UserIds Don't Match Types

**Problem:** Client sends string "123" but server expects number 123 or vice versa.

**Check in server log - look for mismatched types:**
```
Available users: ["123", "456"]    // All strings - ✅ OK
Available users: [123, 456]        // All numbers - ✅ OK
Available users: ["123", 456]      // Mixed - ❌ Problem
```

**Fix:**
1. Verify userId consistency in `App.jsx`:
   ```javascript
   const currentUserId = user?.id || user?._id || null;
   console.log('Type:', typeof currentUserId, 'Value:', currentUserId)
   ```

2. Check both users use same ID format (both strings or both numbers)

## Debugging Checklist

- [ ] Both users show as "Online / Connected" in UI
- [ ] Server log shows both user IDs in "Available users"
- [ ] When caller initiates: Server shows "Receiver has 1 socket(s)" (not 0)
- [ ] Server shows "Emitting call:incoming to receiver"
- [ ] Receiver browser console shows `[useSocket] call:incoming received:`
- [ ] Receiver console shows `[WebRTC] handleCallIncoming triggered`
- [ ] Alert popup appears on receiver (fallback UI)
- [ ] CallModal element exists in DOM
- [ ] CallModal shows in UI with Accept/Reject buttons

## Manual Testing Process

### Setup
1. Terminal: `cd server && npm start`
2. Terminal: `cd client && npm run dev`
3. Browser 1: Login as User A
4. Browser 2: Login as User B
5. Both should show online status for each other

### Initiate Call
1. Browser 1: Click "Audio Call" or "Video Call" button
2. Browser 1: Grant microphone/camera permissions
3. Check console logs (see below)

### Monitor Logs
- **Server:**
  ```bash
  tail -f server/server_debug.txt
  ```
  Watch for call:initiate and call:incoming events

- **Browser 1 (Caller) Console:**
  ```
  [WebRTC] initMediaAndCall called with receiverId: [id], isVideo: false
  [WebRTC] Initiating call to: [id]
  ```

- **Browser 2 (Receiver) Console:**
  ```
  [useSocket] call:incoming received: {...}
  [WebRTC] handleCallIncoming triggered {...}
  // Alert should pop up with caller name
  ```

## WebSocket Network Debugging

Open DevTools → Network tab and monitor WebSocket frames:

1. Filter by `WS` or look for `localhost` WebSocket
2. Click to open the connection details
3. Go to "Frames" tab
4. Trigger a call from Browser 1
5. You should see these frames in order on Receiver (Browser 2):
   ```
   ← {"sid":"...","upgrades":[],...}     // Initial handshake
   → {"userId":"[user-a-id]"}            // user:online event (caller)
   ← 2["call:incoming",{...}]            // call:incoming to receiver
   ```

Frame format: `←` = incoming, `→` = outgoing

## Files Involved

| File | Purpose |
|------|---------|
| `server/socket.js` | Call signaling server handlers |
| `client/src/hooks/useSocket.js` | Socket event listener setup |
| `client/src/hooks/useWebRTC.js` | Call state management & handlers |
| `client/src/App.jsx` | Main component wiring |
| `client/src/components/chat/CallModal.jsx` | Incoming call UI |
| `server/server_debug.txt` | Debug log file |

## Debugging Commands

```javascript
// Check if socket is connected (browser console)
io().connected

// Get socket ID
io().id

// Check if event listener is attached (server side, after connection)
// Look in server debug log for user:online registration

// Monitor all socket events (browser)
// In useSocket.js or add to browser console temporarily
socket.onAny((event, data) => console.log(event, data))
```

## If Issue Persists

1. **Clear and restart:**
   ```bash
   rm server/server_debug.txt  # Clear old logs
   npm restart                  # Restart server
   ```

2. **Full browser refresh:** `Ctrl+Shift+R` (hard refresh)

3. **Verify socket is actually sending call:initiate:**
   - Browser 1 DevTools → Network → WS frames
   - Should see outgoing `call:initiate` event

4. **Check for JavaScript errors:**
   - Browser 2 Console tab
   - Any red error messages?

5. **Verify receiver socket exists when call arrives:**
   - Server debug log should show socketCount > 0

6. **Test with network monitoring:**
   ```bash
   # Check server is receiving socket events (add this temporarily to socket.js)
   socket.onAny((event, data) => { console.log('SOCKET EVENT:', event, data) })
   ```

## Key Points

- ⚠️ Socket listeners attach **once** when user connects
- ✅ Event handlers update **dynamically** through refs
- 🔑 User IDs must match types (string vs number) everywhere
- 📱 Socket connection status affects everything - verify it first
- 🔍 Server debug log is the source of truth for server-side flow

---

**Still stuck?** Start with Issue #1 (Receiver has 0 sockets) - that's usually the root cause.
