package com.jogo._dMultiplayer.game;

// Opcional: com o classeId aqui, o painel de jogadores mostra o sprite de cada um.
public record JogadorInfo(
        String id, int slot, String classe, int classeId,
        int danoFisico, int danoMagico,
        int defesaFisica, int defesaMagica,
        int sorte, int vidaMax) {

    public static JogadorInfo de(Jogador j) {
        return new JogadorInfo(j.getId(), j.getSlot(), j.getNomeClasse(), j.getClasseId(),
                j.getDanoFisico(), j.getDanoMagico(),
                j.getDefesaFisica(), j.getDefesaMagica(),
                j.getSorte(), j.getVida());
    }
}
