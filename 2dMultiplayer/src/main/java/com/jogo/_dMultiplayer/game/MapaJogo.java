package com.jogo._dMultiplayer.game;

public class MapaJogo {
    public static final int TILE = 16;

    private static final String[] LINHAS = {
            "################################",
            "#..............................#",
            "#..............................#",
            "#....####..............####....#",
            "#....#....................#....#",
            "#....#....................#....#",
            "#..............................#",
            "#..............................#",
            "#.............####.............#",
            "#.............####.............#",
            "#..............................#",
            "#..............................#",
            "#....#....................#....#",
            "#....#....................#....#",
            "#....####..............####....#",
            "#..............................#",
            "#..............................#",
            "################################",
    };

    private final boolean[][] parede;

    public MapaJogo() {
        parede = new boolean[LINHAS.length][LINHAS[0].length()];
        for (int l = 0; l < LINHAS.length; l++)
            for (int c = 0; c < LINHAS[l].length(); c++)
                parede[l][c] = LINHAS[l].charAt(c) == '#';
    }

    public boolean ehParede(int col, int lin) {
        if (lin < 0 || lin >= parede.length || col < 0 || col >= parede[0].length) return true;
        return parede[lin][col];
    }

    public boolean colide(double x, double y, double w, double h) {
        int c1 = (int) Math.floor(x / TILE);
        int c2 = (int) Math.floor((x + w - 1) / TILE);
        int l1 = (int) Math.floor(y / TILE);
        int l2 = (int) Math.floor((y + h - 1) / TILE);
        for (int l = l1; l <= l2; l++)
            for (int c = c1; c <= c2; c++)
                if (ehParede(c, l)) return true;
        return false;
    }
}