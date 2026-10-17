import { TAMANHO_JOGADOR } from "../constantes";

export default class RenderizadorJogador {
  desenhar(ctx, jogador, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(Math.round(jogador.x), Math.round(jogador.y), TAMANHO_JOGADOR, TAMANHO_JOGADOR);
  }
}