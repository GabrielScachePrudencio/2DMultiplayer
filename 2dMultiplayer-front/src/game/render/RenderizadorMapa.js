import { TILE } from "../constantes";

const COR_CHAO = "#ffffff";
const COR_MURO = "#2c3e50";

export default class RenderizadorMapa {
  desenhar(ctx, mapa) {
    for (let l = 0; l < mapa.linhas; l++) {
      for (let c = 0; c < mapa.colunas; c++) {
        ctx.fillStyle = mapa.ehParede(c, l) ? COR_MURO : COR_CHAO;
        ctx.fillRect(c * TILE, l * TILE, TILE, TILE);
      }
    }
  }
}