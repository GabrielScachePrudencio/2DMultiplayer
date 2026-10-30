package com.jogo._dMultiplayer.game;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class Jogador {
    public static final int TAMANHO = 12;
    private static final double VELOCIDADE = 90; // pixels por segundo

    private final String id;
    private final int slot; // 0 = lado esquerdo (vermelho), 1 = lado direito (azul)
    private double x, y;
    private volatile int dx, dy;

    //do game
    private int danoFisico = 0;
    private int danoMagico = 0;
    private int defesaFisica = 0;
    private int defesaMagica = 0;
    private int sorte = 0;
    private int vida = 0;
    private int vidaMax = 0;
    private String nomeClasse;
    private int classeId;
    private volatile double anguloMira;
    private volatile boolean quiseAtacar;
    private long ultimoAtaqueMs = -1_000_000;
    private String tipoAtaque = "corpo";
    private double velocidadeAtaque = 1;


    public Jogador(String id, double x, double y, int slot) {
        this.id = id; this.x = x; this.y = y; this.slot = slot;
    }

    public Jogador(String id, double x, double y, int slot, int danoFisico, int danoMagico,
                   int defesaFisica, int defesaMagica, int sorte
    , int vida, int classeId) {
        this(id, x, y, slot);
        setDanoFisico(danoFisico);
        setDanoMagico(danoMagico);
        setDefesaFisica(defesaFisica);
        setDefesaMagica(defesaMagica);
        setSorte(sorte);
        setVida(vida);
        setVidaMax(vida);
        setClasseId(classeId);

    }

    // o servidor só aceita direção (-1, 0 ou 1), nunca posição
    public void setInput(int dx, int dy) {
        this.dx = Integer.signum(dx);
        this.dy = Integer.signum(dy);
    }

    public void mover(double dt, MapaJogo mapa) {
        double ax = dx, ay = dy;
        if (ax != 0 && ay != 0) { ax *= 0.7071; ay *= 0.7071; }
        double passo = VELOCIDADE * dt;

        double nx = x + ax * passo;
        if (!mapa.colide(nx, y, TAMANHO, TAMANHO)) x = nx;

        double ny = y + ay * passo;
        if (!mapa.colide(x, ny, TAMANHO, TAMANHO)) y = ny;
    }

    public void atualizarMira(double alvoX, double alvoY) {
        anguloMira = Math.atan2(
                alvoY - (y + TAMANHO / 2.0),
                alvoX - (x + TAMANHO / 2.0)
        );
    }


    public void configurarAtaque(String tipo, Double velocidade) {
        if (tipo != null) this.tipoAtaque = tipo;
        if (velocidade != null && velocidade > 0) this.velocidadeAtaque = velocidade;
    }
    public String getTipoAtaque() { return tipoAtaque; }

    public void pedirAtaque() { quiseAtacar = true; }
    public boolean consumirPedidoAtaque() { boolean r = quiseAtacar; quiseAtacar = false; return r; }

    public boolean podeAtacar(long agoraMs) { return agoraMs - ultimoAtaqueMs >= (long) (1000 / velocidadeAtaque); }
    public void marcarAtaque(long agoraMs) { ultimoAtaqueMs = agoraMs; }

    public void receberDano(int dano) { vida = Math.max(0, vida - dano); }
    public boolean morto() { return vida <= 0; }
    public void reviver(double novoX, double novoY) { x = novoX; y = novoY; vida = vidaMax; }

}