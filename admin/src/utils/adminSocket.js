// utils/adminSocket.js
// Thin WebSocket client for the admin panel, matching the backend's existing
// `ws` protocol (socket/bettingSocket.js). Registers with `register-admin` so
// the server can verify the JWT and route superadmin-only fraud alerts here.

const { hostname, protocol } = window.location;
const isDev = import.meta.env.DEV;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

export const host = isDev
  ? `${wsProtocol}//${hostname}:4000`
  : `${wsProtocol}//${window.location.host}`;

let socket = null;
let refCount = 0;
let closeTimer = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
const listeners = new Set();

const register = () => {
  const token = localStorage.getItem('token');
  if (!token || socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: 'register-admin', token }));
};

const ensureSocket = () => {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  socket = new WebSocket(host);

  socket.onopen = () => {
    reconnectDelay = 1000;
    register();
  };

  socket.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch {
        // a broken listener must not kill the socket
      }
    });
  };

  socket.onclose = () => {
    socket = null;
    // Only reconnect while something is still listening. Backoff caps at 30s so
    // a server restart does not turn into a reconnect storm.
    if (refCount > 0 && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (refCount > 0) ensureSocket();
      }, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    }
  };

  socket.onerror = () => {
    // handled by onclose
  };

  return socket;
};

export const adminSocket = {
  /** Subscribe to server messages; keeps the socket alive while subscribed. */
  subscribe(listener) {
    refCount += 1;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    listeners.add(listener);
    ensureSocket();
    register();

    return () => {
      listeners.delete(listener);
      refCount = Math.max(0, refCount - 1);

      // Debounced close so React StrictMode's double-mount doesn't churn.
      if (refCount === 0) {
        closeTimer = setTimeout(() => {
          if (refCount === 0 && socket) {
            try {
              socket.close();
            } catch {
              // ignore
            }
            socket = null;
          }
        }, 750);
      }
    };
  },
};
