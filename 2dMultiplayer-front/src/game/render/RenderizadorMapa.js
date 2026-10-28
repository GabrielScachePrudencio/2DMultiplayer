import { TILE } from "../constantes";

export default class RenderizadorMapa {
  desenhar(ctx, mapa) {
    for (let l = 0; l < mapa.linhas; l++) {
      for (let c = 0; c < mapa.colunas; c++) {
        const x = c * TILE;
        const y = l * TILE;
        if (mapa.ehParede(c, l)) {
          this.desenharMuro(ctx, x, y, c, l);
        } else {
          this.desenharChao(ctx, x, y, c, l);
        }
      }

    }

    this.desenharTochas(ctx, mapa);
    this.desenharBandeiras(ctx);
  }

  desenharChao(ctx, x, y, col, lin) {
    const caminho =
      (col >= 30 && col <= 33) ||
      (lin >= 16 && lin <= 18 && col >= 10 && col <= 53) ||
      (col >= 19 && col <= 44 && lin >= 6 && lin <= 29);
    const variacao = (col * 7 + lin * 11) % 3;
    ctx.fillStyle = caminho
      ? ["#98886a", "#a19172", "#8d7d60"][variacao]
      : ["#526f43", "#587648", "#5d794a"][variacao];
    ctx.fillRect(x, y, TILE, TILE);

    ctx.fillStyle = caminho ? "rgba(54, 46, 34, 0.16)" : "rgba(29, 49, 30, 0.2)";
    ctx.fillRect(x, y + TILE - 1, TILE, 1);
    ctx.fillRect(x + TILE - 1, y, 1, TILE);

    if (!caminho && (col * 13 + lin * 5) % 7 === 0) {
      ctx.fillStyle = "#789052";
      ctx.fillRect(x + 4, y + 5, 2, 2);
      ctx.fillRect(x + 10, y + 10, 2, 2);
    } else if (caminho && (col + lin) % 5 === 0) {
      ctx.fillStyle = "rgba(62, 53, 42, 0.32)";
      ctx.fillRect(x + 4, y + 7, 5, 1);
    }
  }

  desenharMuro(ctx, x, y, col, lin) {
    ctx.fillStyle = "#626d78";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#87929b";
    ctx.fillRect(x, y, TILE, 3);
    ctx.fillStyle = "#4b5661";
    ctx.fillRect(x, y + TILE - 3, TILE, 3);

    const junta = lin % 2 === 0 ? 8 : 0;
    ctx.fillStyle = "#4f5b65";
    ctx.fillRect(x + junta, y + 3, 1, 5);
    ctx.fillRect(x + (junta + 8) % TILE, y + 9, 1, 4);
    if ((col + lin) % 3 === 0) {
      ctx.fillStyle = "#a0a9ad";
      ctx.fillRect(x + 3, y + 4, 3, 1);
    }
  }

  desenharTochas(ctx, mapa) {
    for (const col of [15, 48]) {
      for (const lin of [5, 14, 21, 30]) {
        if (!mapa.ehParede(col, lin)) continue;
        const x = col * TILE;
        const y = lin * TILE;
        ctx.fillStyle = "#f4a340";
        ctx.fillRect(x + 6, y + 4, 4, 5);
        ctx.fillStyle = "#ffe08a";
        ctx.fillRect(x + 7, y + 3, 2, 3);
        ctx.fillStyle = "#553d32";
        ctx.fillRect(x + 5, y + 9, 6, 2);
      }
    }
  }

  desenharBandeiras(ctx) {
    for (const col of [25, 38]) {
      const x = col * TILE;
      const y = 12 * TILE;
      ctx.fillStyle = "#d5bc83";
      ctx.fillRect(x + 7, y + 2, 2, 12);
      ctx.fillStyle = col === 25 ? "#8f3438" : "#345b82";
      ctx.fillRect(x + 9, y + 3, 5, 6);
      ctx.fillRect(x + 9, y + 8, 3, 2);
    }
  }
}