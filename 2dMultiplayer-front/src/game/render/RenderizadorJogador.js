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
      const sy = y + TAMANHO_JOGADOR - TAMANHO_SPRITE + 2;
      const angulo = jogador.anguloMira ?? 0;
      const centroX = x + TAMANHO_JOGADOR / 2;
      const centroY = y + TAMANHO_JOGADOR / 2;

      ctx.save();
      ctx.translate(centroX, 0);
      if (Math.cos(angulo) < 0) ctx.scale(-1, 1);
      ctx.drawImage(img, -TAMANHO_SPRITE / 2, sy);
      ctx.restore();

      const pontaX = centroX + Math.cos(angulo) * 19;
      const pontaY = centroY + Math.sin(angulo) * 19;
      const baseX = pontaX - Math.cos(angulo) * 6;
      const baseY = pontaY - Math.sin(angulo) * 6;
      const ladoX = Math.cos(angulo + Math.PI / 2) * 4;
      const ladoY = Math.sin(angulo + Math.PI / 2) * 4;

      ctx.strokeStyle = "#1b1712";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centroX, centroY);
      ctx.lineTo(pontaX, pontaY);
      ctx.stroke();

      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centroX, centroY);
      ctx.lineTo(pontaX, pontaY);
      ctx.stroke();

      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(pontaX, pontaY);
      ctx.lineTo(baseX + ladoX, baseY + ladoY);
      ctx.lineTo(baseX - ladoX, baseY - ladoY);
      ctx.closePath();
      ctx.fill();

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
