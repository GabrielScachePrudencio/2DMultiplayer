package com.jogo._dMultiplayer.websocket;
import com.jogo._dMultiplayer.event.ContagemMudouEvent;
import com.jogo._dMultiplayer.game.InimigoInfo;
import com.jogo._dMultiplayer.game.JogadorInfo;
import com.jogo._dMultiplayer.model.Classes;
import com.jogo._dMultiplayer.model.Salas;
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

    private static final int TICKS_POR_SEGUNDO = 30;

    private final ClassesService classesService;
    private final SalasService salasService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final MapaJogo mapaJogo = new MapaJogo();

    private final Map<String, Set<WebSocketSession>> salas = new ConcurrentHashMap<>();
    private final Map<String, String> sessaoParaSala = new ConcurrentHashMap<>();
    private final Map<String, Jogador> jogadores = new ConcurrentHashMap<>(); // id da sessão -> jogador
    private final Map<String, InimigoInfo> inimigosTestePorSala = new ConcurrentHashMap<>();
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
            for (Map.Entry<String, Set<WebSocketSession>> sala : salas.entrySet()) {
                Set<WebSocketSession> sessoes = sala.getValue();
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
                            "classeId", j.getClasseId(),
                            "anguloMira", j.getAnguloMira()
                    ));
                }
                InimigoInfo inimigo = inimigosTestePorSala.get(sala.getKey());
                Map<String, Object> msg = Map.of(
                        "tipo", "estado",
                        "jogadores", dados,
                        "inimigos", inimigo == null ? List.of() : List.of(inimigo));
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
        } else if ("mira".equals(tipo)) {
            Jogador j = jogadores.get(session.getId());
            double x = json.path("x").asDouble();
            double y = json.path("y").asDouble();

            if (j != null && Double.isFinite(x) && Double.isFinite(y)) {
                j.atualizarMira(x, y);
            }
        }

    }

    private void entrar(WebSocketSession session, String codigo, int classeId) {
        if (sessaoParaSala.containsKey(session.getId())) return;

        Salas sala = salasService.findByCodigo(codigo);
        if (sala == null) {
            enviar(session, Map.of("tipo", "erro", "mensagem", "Sala não existe"));
            return;
        }
        int capacidade = sala.getCapacidade();
        if (capacidade <= 0) {
            enviar(session, Map.of("tipo", "erro", "mensagem", "Capacidade da sala inválida"));
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
            if (sessoes.size() >= capacidade) {
                enviar(session, Map.of("tipo", "erro", "mensagem", "Sala cheia"));
                return;
            }
            int slot = escolherSlot(sessoes, capacidade);
            double[] spawn = escolherSpawn(sessoes);
            if (spawn == null) {
                enviar(session, Map.of("tipo", "erro", "mensagem", "Não há posições livres no mapa"));
                return;
            }

            Jogador novo = new Jogador(session.getId(), spawn[0], spawn[1], slot,
                    classe.getDanoFisico(), classe.getDanoMagico(),
                    classe.getDefesaFisica(), classe.getDefesaMagica(),
                    classe.getSorte(), classe.getVida(), classeId);
            novo.setNomeClasse(classe.getNome());
            jogadores.put(session.getId(), novo);
            sessoes.add(session);
            sessaoParaSala.put(session.getId(), codigo);
            inimigosTestePorSala.computeIfAbsent(codigo, chave ->
                    new InimigoInfo("goblin-treino", "Goblin de treino", "goblin",
                            548, 280, 100, 100));
        }
        avisarSala(codigo, capacidade);
    }

    // primeiro slot livre (se o 0 saiu, quem entra ocupa o lado esquerdo)
    private int escolherSlot(Set<WebSocketSession> sessoes, int capacidade) {
        Set<Integer> usados = new HashSet<>();
        for (WebSocketSession s : sessoes) {
            Jogador j = jogadores.get(s.getId());
            if (j != null && j.getSlot() < capacidade) usados.add(j.getSlot());
        }
        for (int i = 0; i < capacidade; i++) if (!usados.contains(i)) return i;
        return 0;
    }

    private double[] escolherSpawn(Set<WebSocketSession> sessoes) {
        List<Jogador> jogadoresNaSala = sessoes.stream()
                .map(s -> jogadores.get(s.getId()))
                .filter(Objects::nonNull)
                .toList();

        double[] spawn = melhorSpawn(jogadoresNaSala, true);
        return spawn != null ? spawn : melhorSpawn(jogadoresNaSala, false);
    }

    private double[] melhorSpawn(List<Jogador> jogadoresNaSala, boolean patioCentral) {
        double[] melhor = null;
        double melhorPontuacao = Double.NEGATIVE_INFINITY;
        int centroX = mapaJogo.colunas() / 2;
        int centroY = mapaJogo.linhas() / 2;
        int inicioColuna = patioCentral ? centroX - 9 : 1;
        int fimColuna = patioCentral ? centroX + 8 : mapaJogo.colunas() - 2;
        int inicioLinha = patioCentral ? centroY - 9 : 1;
        int fimLinha = patioCentral ? centroY + 8 : mapaJogo.linhas() - 2;
        int deslocamento = (MapaJogo.TILE - Jogador.TAMANHO) / 2;

        for (int linha = inicioLinha; linha <= fimLinha; linha++) {
            for (int coluna = inicioColuna; coluna <= fimColuna; coluna++) {
                double x = coluna * MapaJogo.TILE + deslocamento;
                double y = linha * MapaJogo.TILE + deslocamento;
                if (mapaJogo.colide(x, y, Jogador.TAMANHO, Jogador.TAMANHO)) continue;

                double pontuacao = jogadoresNaSala.isEmpty()
                        ? -distanciaQuadrada(x, y, centroX * MapaJogo.TILE, centroY * MapaJogo.TILE)
                        : Double.POSITIVE_INFINITY;
                boolean sobrepoeJogador = false;
                for (Jogador jogador : jogadoresNaSala) {
                    if (x < jogador.getX() + Jogador.TAMANHO
                            && x + Jogador.TAMANHO > jogador.getX()
                            && y < jogador.getY() + Jogador.TAMANHO
                            && y + Jogador.TAMANHO > jogador.getY()) {
                        sobrepoeJogador = true;
                        break;
                    }
                    if (!jogadoresNaSala.isEmpty()) {
                        pontuacao = Math.min(
                                pontuacao,
                                distanciaQuadrada(x, y, jogador.getX(), jogador.getY())
                        );
                    }
                }
                if (!sobrepoeJogador && pontuacao > melhorPontuacao) {
                    melhorPontuacao = pontuacao;
                    melhor = new double[]{x, y};
                }
            }
        }
        return melhor;
    }

    private double distanciaQuadrada(double x1, double y1, double x2, double y2) {
        double dx = x1 - x2;
        double dy = y1 - y2;
        return dx * dx + dy * dy;
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
            if (sessoes.isEmpty()) {
                salas.remove(codigo);
                inimigosTestePorSala.remove(codigo);
            }
        }
        Salas sala = salasService.findByCodigo(codigo);
        avisarSala(codigo, sala == null ? 0 : sala.getCapacidade());
    }

    private void avisarSala(String codigo, int capacidade) {
        Set<WebSocketSession> sessoes = salas.getOrDefault(codigo, Set.of());

        List<JogadorInfo> infos = new ArrayList<>();
        for (WebSocketSession s : sessoes) {
            Jogador j = jogadores.get(s.getId());
            if (j != null) infos.add(JogadorInfo.de(j));
        }
        infos.sort(Comparator.comparingInt(JogadorInfo::slot));

        Map<String, Object> msg = Map.of(
                "tipo", "sala:atualizada", "total", sessoes.size(),
                "max", capacidade, "jogadores", infos);
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