const LARGURA_BARRA = 24;

export default class RenderizadorInimigo {
  desenhar(ctx, inimigo) {
    const x = Math.round(inimigo.x);
    const y = Math.round(inimigo.y);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 15, 8, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#24522d";
    ctx.fillRect(x + 2, y + 5, 12, 10);
    ctx.fillStyle = "#4b9b45";
    ctx.fillRect(x + 4, y + 3, 10, 10);
    ctx.fillStyle = "#6bbb50";
    ctx.fillRect(x + 6, y + 4, 6, 8);

    ctx.fillStyle = "#3d823b";
    ctx.fillRect(x, y + 3, 5, 5);
    ctx.fillRect(x + 13, y + 3, 5, 5);
    ctx.fillStyle = "#f4d36b";
    ctx.fillRect(x + 6, y + 6, 2, 2);
    ctx.fillRect(x + 11, y + 6, 2, 2);
    ctx.fillStyle = "#24251d";
    ctx.fillRect(x + 7, y + 6, 1, 2);
    ctx.fillRect(x + 12, y + 6, 1, 2);
    ctx.fillStyle = "#db8061";
    ctx.fillRect(x + 8, y + 10, 4, 1);
    ctx.fillStyle = "#523c2a";
    ctx.fillRect(x + 4, y + 14, 4, 2);
    ctx.fillRect(x + 10, y + 14, 4, 2);

    const vidaMax = Math.max(1, inimigo.vidaMax);
    const vida = Math.max(0, Math.min(inimigo.vida, vidaMax));
    const barraX = x + 9 - LARGURA_BARRA / 2;
    const barraY = y - 5;
    ctx.fillStyle = "#171717";
    ctx.fillRect(barraX - 1, barraY - 1, LARGURA_BARRA + 2, 4);
    ctx.fillStyle = "#d64545";
    ctx.fillRect(barraX, barraY, Math.round(LARGURA_BARRA * (vida / vidaMax)), 2);

    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const nome = inimigo.nome ?? "Inimigo";
    const textoX = x + 9;
    const textoY = y - 7;
    const larguraTexto = ctx.measureText(nome).width;
    ctx.fillStyle = "rgba(15, 20, 16, 0.85)";
    ctx.fillRect(textoX - larguraTexto / 2 - 2, textoY - 10, larguraTexto + 4, 11);
    ctx.fillStyle = "#fff";
    ctx.fillText(nome, textoX, textoY);
  }
}
