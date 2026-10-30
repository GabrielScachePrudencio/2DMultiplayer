package com.jogo._dMultiplayer.game;

public final class Combate {
    public static final double MULTIPLICADOR_DANO = 0.2; // ajuste para balancear

    private Combate() {}

    public static double diferencaAngular(double a, double b) {
        return Math.atan2(Math.sin(a - b), Math.cos(a - b)); // menor diferença, -PI..PI
    }

    // leque na frente do atacante
    public static boolean acertouGolpe(double ox, double oy, double angulo,
                                       double alvoX, double alvoY, double alvoRaio,
                                       double alcance, double arcoGraus) {
        double dx = alvoX - ox, dy = alvoY - oy;
        if (Math.hypot(dx, dy) - alvoRaio > alcance) return false;
        double meioArco = Math.toRadians(arcoGraus / 2);
        return Math.abs(diferencaAngular(Math.atan2(dy, dx), angulo)) <= meioArco;
    }

    public static boolean projetilAcertou(double px, double py, double raioProj,
                                          double alvoX, double alvoY, double alvoRaio) {
        return Math.hypot(alvoX - px, alvoY - py) <= alvoRaio + raioProj;
    }

    public static boolean rolarCritico(int sorte) {
        return Math.random() < sorte / 300.0; // sorte 20 => 7%, sorte 95 => 32%
    }

    // seus atributos vão de 5 a 100, então "ataque - defesa" não serve:
    // a defesa reduz em proporção (defesa 100 corta o dano pela metade)
    public static int calcularDano(int ataque, int defesa, boolean critico) {
        double dano = ataque * MULTIPLICADOR_DANO * 100.0 / (100 + defesa);
        if (critico) dano *= 2;
        return Math.max(1, (int) Math.round(dano));
    }
}