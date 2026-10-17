const dev = process.env.NODE_ENV === "development";

export const API_URL = dev ? "http://localhost:8080" : "";

export const WS_URL = dev
  ? "ws://localhost:8080/ws"
  : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

  export const LOBBY_WS_URL = dev
  ? "ws://localhost:8080/lobby-ws"
  : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/lobby-ws`;