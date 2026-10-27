import { TAMANHO_JOGADOR } from "../constantes";
import { TAMANHO_SPRITE } from "../spritesClasses";

const LARGURA_BARRA = 20;

export default class RenderizadorJogador {
  constructor(sprites) {
    this.sprites = sprites; // { idDaClasse: Image }
  }

  desenhar(ctx, jogador, cor) {
    const x = Math.round(jogador.x);
    const y = Math.round(jogador.y);
    let topo = y;

    const img = this.sprites[jogador.classeId];
    if (img && img.complete && img.naturalWidth > 0) {
      // o sprite fica centralizado no corpo (hitbox) e com os pes na base dele
      const sx = Math.round(x + TAMANHO_JOGADOR / 2 - TAMANHO_SPRITE / 2);
      const sy = y + TAMANHO_JOGADOR - TAMANHO_SPRITE + 2;
      ctx.drawImage(img, sx, sy);
      topo = sy;
    } else {
      // sem sprite (ainda carregando ou classe sem imagem): quadrado colorido
      ctx.fillStyle = cor;
      ctx.fillRect(x, y, TAMANHO_JOGADOR, TAMANHO_JOGADOR);
    }

    // barra de vida acima da cabeca
    if (jogador.vidaMax > 0) {
      const pct = Math.max(0, jogador.vida / jogador.vidaMax);
      const bx = Math.round(x + TAMANHO_JOGADOR / 2 - LARGURA_BARRA / 2);
      const by = Math.max(2, topo - 4);
      ctx.fillStyle = "#000";
      ctx.fillRect(bx - 1, by - 1, LARGURA_BARRA + 2, 4);
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(bx, by, Math.round(LARGURA_BARRA * pct), 2);
    }
  }
}
