package com.jogo._dMultiplayer.websocket;
import com.jogo._dMultiplayer.event.ContagemMudouEvent;
import com.jogo._dMultiplayer.game.JogadorInfo;
import com.jogo._dMultiplayer.model.Classes;
import com.jogo._dMultiplayer.service.ClassesService;
import org.springframework.context.ApplicationEventPublisher;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.jogo._dMultiplayer.game.Jogador;
import com.jogo._dMultiplayer.game.MapaJogo;
import com.jogo._dMultiplayer.service.SalasService;
import jakarta.annotation.PostConstruct;   // Spring Boot 2: javax.annotation
import jakarta.annotation.PreDestroy;      // Spring Boot 2: javax.annotation
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
public class SalaWebSocketHandler extends TextWebSocketHandler {

    private static final int MAX = 2;
    private static final int TICKS_POR_SEGUNDO = 30;
    private static final double[][] SPAWNS = { {40, 140}, {460, 140} };


    private final ClassesService classesService;
    private final SalasService salasService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final MapaJogo mapaJogo = new MapaJogo();

    private final Map<String, Set<WebSocketSession>> salas = new ConcurrentHashMap<>();
    private final Map<String, String> sessaoParaSala = new ConcurrentHashMap<>();
    private final Map<String, Jogador> jogadores = new ConcurrentHashMap<>(); // id da sessão -> jogador
    private final ApplicationEventPublisher publisher;

    private ScheduledExecutorService loop;

    @PostConstruct
    void iniciarLoop() {
        loop = Executors.newSingleThreadScheduledExecutor();
        loop.scheduleAtFixedRate(this::tick, 0, 1000 / TICKS_POR_SEGUNDO, TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    void pararLoop() {
        loop.shutdownNow();
    }

    // roda 30x por segundo: move todo mundo e manda o estado de cada sala
    private void tick() {
        try { // sem try/catch, uma exceção cancela o loop para sempre
            double dt = 1.0 / TICKS_POR_SEGUNDO;
            for (Set<WebSocketSession> sessoes : salas.values()) {
                List<Jogador> lista = new ArrayList<>();
                for (WebSocketSession s : sessoes) {
                    Jogador j = jogadores.get(s.getId());
                    if (j != null) { j.mover(dt, mapaJogo); lista.add(j); }
                }
                lista.sort(Comparator.comparingInt(Jogador::getSlot));

                List<Map<String, Object>> dados = new ArrayList<>();
                for (Jogador j : lista) {
                    dados.add(Map.of("id", j.getId(), "slot", j.getSlot(),
                            "x", Math.round(j.getX()), "y", Math.round(j.getY()),
                            "vida", j.getVida(), "vidaMax", j.getVida(),
                            "classeId", j.getClasseId()));
                }
                Map<String, Object> msg = Map.of("tipo", "estado", "jogadores", dados);
                for (WebSocketSession s : sessoes) enviar(s, msg);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode json = mapper.readTree(message.getPayload());
        String tipo = json.path("tipo").asText();

        if ("entrar".equals(tipo)) {
            entrar(session, json.path("codigo").asText(), json.path("classeId").asInt());
        } else if ("input".equals(tipo)) {
            Jogador j = jogadores.get(session.getId());
            if (j != null) j.setInput(json.path("dx").asInt(), json.path("dy").asInt());
        }
    }

    private void entrar(WebSocketSession session, String codigo, int classeId) {
        if (sessaoParaSala.containsKey(session.getId())) return;

        if (salasService.findByCodigo(codigo) == null) {
            enviar(session, Map.of("tipo", "erro", "mensagem", "Sala não existe"));
            return;
        }
        Optional<Classes> opt = classesService.findById(classeId);
        if (opt.isEmpty()) {
            enviar(session, Map.of("tipo", "erro", "mensagem", "Classe inválida"));
            return;
        }
        Classes classe = opt.get();
        synchronized (this) {
            Set<WebSocketSession> sessoes =
                    salas.computeIfAbsent(codigo, k -> ConcurrentHashMap.newKeySet());
            if (sessoes.size() >= MAX) {
                enviar(session, Map.of("tipo", "erro", "mensagem", "Sala cheia"));
                return;
            }
            int slot = escolherSlot(sessoes);

            Jogador novo = new Jogador(session.getId(), SPAWNS[slot][0], SPAWNS[slot][1], slot,
                    classe.getDanoFisico(), classe.getDanoMagico(),
                    classe.getDefesaFisica(), classe.getDefesaMagica(),
                    classe.getSorte(), classe.getVida(), classeId);
            novo.setNomeClasse(classe.getNome());
            jogadores.put(session.getId(), novo);
            sessoes.add(session);
            sessaoParaSala.put(session.getId(), codigo);
        }
        avisarSala(codigo);
    }

    // primeiro slot livre (se o 0 saiu, quem entra ocupa o lado esquerdo)
    private int escolherSlot(Set<WebSocketSession> sessoes) {
        boolean[] usado = new boolean[MAX];
        for (WebSocketSession s : sessoes) {
            Jogador j = jogadores.get(s.getId());
            if (j != null) usado[j.getSlot()] = true;
        }
        for (int i = 0; i < MAX; i++) if (!usado[i]) return i;
        return 0;
    }
    public Map<String, Integer> contagens() {
        Map<String, Integer> resultado = new HashMap<>();
        salas.forEach((codigo, sessoes) -> resultado.put(codigo, sessoes.size()));
        return resultado;
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        jogadores.remove(session.getId());
        String codigo = sessaoParaSala.remove(session.getId());
        if (codigo == null) return;
        Set<WebSocketSession> sessoes = salas.get(codigo);
        if (sessoes != null) {
            sessoes.remove(session);
            if (sessoes.isEmpty()) salas.remove(codigo);
        }
        avisarSala(codigo);
    }

    private void avisarSala(String codigo) {
        Set<WebSocketSession> sessoes = salas.getOrDefault(codigo, Set.of());

        List<JogadorInfo> infos = new ArrayList<>();
        for (WebSocketSession s : sessoes) {
            Jogador j = jogadores.get(s.getId());
            if (j != null) infos.add(JogadorInfo.de(j));
        }
        infos.sort(Comparator.comparingInt(JogadorInfo::slot));

        Map<String, Object> msg = Map.of(
                "tipo", "sala:atualizada", "total", sessoes.size(),
                "max", MAX, "jogadores", infos);
        for (WebSocketSession s : sessoes) enviar(s, msg);

        publisher.publishEvent(new ContagemMudouEvent());
    }

    private void enviar(WebSocketSession session, Object obj) {
        try {
            synchronized (session) {
                if (session.isOpen()) session.sendMessage(new TextMessage(mapper.writeValueAsString(obj)));
            }
        } catch (IOException ignored) {}
    }
}