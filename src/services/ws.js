// @ts-nocheck
const noop = () => {};

const resolveData = (data) => {
  if (typeof data === "string") {
    return data;
  }
  try {
    return JSON.stringify(data);
  } catch (error) {
    return "";
  }
};

export const createWebSocketManager = (url, options = {}) => {
  const reconnectDelay = options.reconnectDelay ?? 5000;
  const pingInterval = options.pingInterval ?? 30000;

  let socket = null;
  let handlers = {};
  let reconnectTimer = null;
  let pingTimer = null;
  let autoConnect = false;
  let capabilityEnabled = true;
  let latestToken = null;

  const getEndpoint = () => {
    if (!latestToken) {
      return `${url}/ws`;
    }
    return `${url}/ws?token=${encodeURIComponent(latestToken)}`;
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const clearPingTimer = () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  };

  const detachSocket = () => {
    if (!socket) {
      return;
    }

    socket.removeEventListener("open", handleOpen);
    socket.removeEventListener("message", handleMessage);
    socket.removeEventListener("error", handleError);
    socket.removeEventListener("close", handleClose);
    try {
      socket.close();
    } catch (error) {
      // ignore close errors
    }
    socket = null;
  };

  const scheduleReconnect = () => {
    clearReconnectTimer();
    if (!autoConnect || !capabilityEnabled) {
      return;
    }
    reconnectTimer = setTimeout(() => {
      openSocket();
    }, reconnectDelay);
  };

  const handleOpen = () => {
    clearPingTimer();
    if (pingInterval > 0 && socket) {
      pingTimer = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(resolveData({ type: "ping" }));
        }
      }, pingInterval);
    }
    (handlers.onOpen || noop)(socket);
  };

  const handleMessage = (event) => {
    (handlers.onMessage || noop)(event);
  };

  const handleError = (event) => {
    (handlers.onError || noop)(event);
  };

  const handleClose = (event) => {
    clearPingTimer();
    (handlers.onClose || noop)(event);
    scheduleReconnect();
  };

  const openSocket = () => {
    if (!capabilityEnabled) {
      return;
    }

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    detachSocket();
    clearReconnectTimer();

    try {
      socket = new WebSocket(getEndpoint());
    } catch (error) {
      scheduleReconnect();
      return;
    }

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", handleError);
    socket.addEventListener("close", handleClose);
  };

  const connect = (token) => {
    if (typeof token === "string") {
      latestToken = token;
    }
    autoConnect = true;
    if (!capabilityEnabled) {
      return;
    }
    openSocket();
  };

  const disconnect = () => {
    autoConnect = false;
    clearReconnectTimer();
    clearPingTimer();
    detachSocket();
  };

  const shutdown = () => {
    capabilityEnabled = false;
    autoConnect = false;
    clearReconnectTimer();
    clearPingTimer();
    detachSocket();
  };

  const setCapabilityEnabled = (enabled) => {
    capabilityEnabled = enabled;
    if (!enabled) {
      clearReconnectTimer();
      clearPingTimer();
      detachSocket();
      return;
    }
    if (autoConnect) {
      openSocket();
    }
  };

  const updateToken = (token) => {
    if (typeof token === "string" && token !== latestToken) {
      latestToken = token;
      if (autoConnect && capabilityEnabled) {
        detachSocket();
        openSocket();
      }
    }
  };

  const send = (payload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const value = resolveData(payload);
    if (!value) {
      return;
    }
    socket.send(value);
  };

  const setHandlers = (nextHandlers = {}) => {
    handlers = nextHandlers || {};
  };

  const isConnected = () => socket?.readyState === WebSocket.OPEN;

  return {
    connect,
    disconnect,
    shutdown,
    setCapabilityEnabled,
    updateToken,
    send,
    setHandlers,
    isConnected,
  };
};

export default createWebSocketManager;
