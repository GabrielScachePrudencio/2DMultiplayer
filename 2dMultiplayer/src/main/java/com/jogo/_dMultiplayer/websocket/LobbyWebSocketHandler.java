package com.jogo._dMultiplayer.websocket;

import com.jogo._dMultiplayer.event.ContagemMudouEvent;
import com.jogo._dMultiplayer.event.SalasMudaramEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class LobbyWebSocketHandler extends TextWebSocketHandler {
    private final SalaWebSocketHandler salaHandler;
    private final ObjectMapper mapper = new ObjectMapper();

    private final Set<WebSocketSession> espectadores = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        espectadores.add(session);
        enviar(session, mensagemContagem());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        espectadores.remove(session);
    }
    @EventListener
    public void aoMudarContagem(ContagemMudouEvent evento) {
        Map<String, Object> msg = mensagemContagem();
        for (WebSocketSession s : espectadores) enviar(s, msg);
    }

    @EventListener
    public void aoMudarSala(SalasMudaramEvent evento){
        Map<String, Object> msg = Map.of("tipo", "lobby:salas-mudaram");
        for(WebSocketSession s : espectadores) enviar(s, msg);
    }

    private Map<String, Object> mensagemContagem(){
        return Map.of("tipo", "lobby:contagem","contagens", salaHandler.contagens());
    }

    private void enviar(WebSocketSession session, Object obj){
        try {
            synchronized (session){
                if(session.isOpen())    {
                    session.sendMessage(new TextMessage(mapper.writeValueAsString(obj)));
                }
            }
        }
        catch (Exception ignored){

        }
    }
}
