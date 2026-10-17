package com.jogo._dMultiplayer.game;

public class Jogador {
    public static final int TAMANHO = 12;
    private static final double VELOCIDADE = 90; // pixels por segundo

    private final String id;
    private final int slot; // 0 = lado esquerdo (vermelho), 1 = lado direito (azul)
    private double x, y;
    private volatile int dx, dy;

    public Jogador(String id, double x, double y, int slot) {
        this.id = id; this.x = x; this.y = y; this.slot = slot;
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

    public String getId() { return id; }
    public int getSlot() { return slot; }
    public double getX() { return x; }
    public double getY() { return y; }
}