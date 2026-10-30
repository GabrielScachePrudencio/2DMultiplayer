package com.jogo._dMultiplayer.game;

public class Inimigo {
    public final String id = "goblin-treino", nome = "Goblin de treino", tipo = "goblin";
    public double x, y;
    public int vida, vidaMax;
    public int defesaFisica = 10, defesaMagica = 10;
    public final double raio = 10;

    public Inimigo(double x, double y, int vidaMax) {
        this.x = x; this.y = y; this.vida = vidaMax; this.vidaMax = vidaMax;
    }

    public InimigoInfo paraInfo() {
        return new InimigoInfo(id, nome, tipo,
                (int) Math.round(x), (int) Math.round(y), vida, vidaMax);
    }
}