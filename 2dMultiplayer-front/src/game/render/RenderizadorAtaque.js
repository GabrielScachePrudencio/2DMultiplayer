import { TAMANHO_JOGADOR } from "../constantes";

export default class RenderizadorAtaque {
    desenhar(ctx, ataques, cameraX, cameraY, agora) {
        ctx.save();
        ctx.translate(-cameraX, -cameraY);
        for (const a of ataques) {
            if (a.tipo === "corpo") {
                const meio = ((a.arcoGraus / 2) * Math.PI) / 180;
                const vida = Math.max(0, 1 -(agora - a.nascimento)/ 150);
                ctx.fillStyle = `rgba(255, 209, 102, ${0.75 * vida})`;
                ctx.beginPath();
                ctx.moveTo(
                    a.x + Math.cos(a.angulo) * TAMANHO_JOGADOR / 2,
                    a.y + Math.sin(a.angulo) * TAMANHO_JOGADOR / 2
                );
                ctx.arc(a.x, a.y, a.alcance, a.angulo - meio, a.angulo + meio);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = "#ffd166";
                ctx.beginPath();
                ctx.strokeStyle = "#1b1712";
                ctx.lineWidth = 1;
                ctx.arc(a.x, a.y, a.raio ?? 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}