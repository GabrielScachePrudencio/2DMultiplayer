package com.jogo._dMultiplayer.game;

public class Projetil {
    public final String donoId;
    public double x, y, percorrido;
    public final double vx, vy, alcance, raio;
    public final int dano;
    public final boolean magico;

    public Projetil(String donoId, double x, double y, double angulo, FichaAtaque f, int dano) {
        this.donoId = donoId;
        this.x = x; this.y = y;
        this.vx = Math.cos(angulo) * f.velocidade();
        this.vy = Math.sin(angulo) * f.velocidade();
        this.alcance = f.alcance();
        this.raio = f.raio();
        this.dano = dano;
        this.magico = f.magico();
    }

    public void mover(double dt) {
        x += vx * dt;
        y += vy * dt;
        percorrido += Math.hypot(vx * dt, vy * dt);
    }
}