package com.jogo._dMultiplayer.game;

public record FichaAtaque(boolean corpo, boolean magico, double alcance,
                          double arcoGraus, double velocidade, double raio) {
    public static FichaAtaque de(String tipo) {
        if ("projetil".equals(tipo)) return new FichaAtaque(false, false, 240, 0, 280, 3);
        if ("magia".equals(tipo))    return new FichaAtaque(false, true,  200, 0, 160, 6);
        return new FichaAtaque(true, false, 34, 110, 0, 0); // corpo (e padrão)
    }
}