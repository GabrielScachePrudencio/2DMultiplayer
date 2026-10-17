package com.jogo._dMultiplayer.config;

import com.jogo._dMultiplayer.websocket.LobbyWebSocketHandler;
import com.jogo._dMultiplayer.websocket.SalaWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final SalaWebSocketHandler handler;
    private final LobbyWebSocketHandler lobby;
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:3000",
                        "https://*.ngrok-free.app",
                        "https://*.ngrok-free.dev",
                        "https://*.ngrok.app");
        registry.addHandler(lobby, "/lobby-ws").setAllowedOriginPatterns(
                "http://localhost:3000",
                "https://*.ngrok-free.app",
                "https://*.ngrok-free.dev",
                "https://*.ngrok.app");
    }
}