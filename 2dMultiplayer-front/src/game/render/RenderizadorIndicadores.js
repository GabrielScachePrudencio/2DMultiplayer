import { LARGURA_VIEWPORT, ALTURA_VIEWPORT, TAMANHO_JOGADOR, CORES_JOGADOR } from "../constantes";

const MARGEM = 12; // distância da seta até a borda da tela

export default class RenderizadorIndicadores {
  // Desenha em coordenadas da TELA (sem translate de câmera).
  desenhar(ctx, jogadores, meuId, cameraX, cameraY) {
    const centroTelaX = LARGURA_VIEWPORT / 2;
    const centroTelaY = ALTURA_VIEWPORT / 2;

    for (const j of jogadores) {
      if (j.id === meuId) continue;

      // posição do outro jogador na tela (pode cair fora dela)
      const sx = j.x + TAMANHO_JOGADOR / 2 - cameraX;
      const sy = j.y + TAMANHO_JOGADOR / 2 - cameraY;

      const visivel = sx >= 0 && sx <= LARGURA_VIEWPORT && sy >= 0 && sy <= ALTURA_VIEWPORT;
      if (visivel) continue;

      // direção do centro da tela até ele
      const dx = sx - centroTelaX;
      const dy = sy - centroTelaY;

      // encolhe o vetor até encostar na borda (menos a margem)
      const t = Math.min(
        (centroTelaX - MARGEM) / Math.abs(dx || 1e-6),
        (centroTelaY - MARGEM) / Math.abs(dy || 1e-6)
      );
      const px = centroTelaX + dx * t;
      const py = centroTelaY + dy * t;
      const angulo = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angulo);
      ctx.beginPath();
      ctx.moveTo(8, 0);   // ponta
      ctx.lineTo(-6, -6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fillStyle = CORES_JOGADOR[j.slot % CORES_JOGADOR.length];
      ctx.strokeStyle = "#0d0c13";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
  }
}