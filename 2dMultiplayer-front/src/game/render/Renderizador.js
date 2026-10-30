import {
  ALTURA_VIEWPORT,
  ALTURA,
  CORES_JOGADOR,
  LARGURA_VIEWPORT,
  LARGURA,
  TAMANHO_JOGADOR,
} from "../constantes";
import { carregarSprites } from "../spritesClasses";
import RenderizadorMapa from "./RenderizadorMapa";
import RenderizadorInimigo from "./RenderizadorInimigo";
import RenderizadorJogador from "./RenderizadorJogador";

export default class Renderizador {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false; // pixel nitido
    this.mapaR = new RenderizadorMapa();
    this.inimigoR = new RenderizadorInimigo();
    this.jogadorR = new RenderizadorJogador(carregarSprites());
  }

  desenhar(mapa, jogadores, inimigos = [], meuId = null) {
  this.ctx.clearRect(0, 0, LARGURA_VIEWPORT, ALTURA_VIEWPORT);
  const { cameraX, cameraY } = this.calcularCamera(jogadores, meuId);

  this.ctx.save();
  this.ctx.translate(-cameraX, -cameraY);
  this.mapaR.desenhar(this.ctx, mapa);

  // quem esta mais embaixo na tela e desenhado por cima
  const entidades = [
    ...jogadores.map((entidade) => ({ ...entidade, tipoRenderizacao: "jogador" })),
    ...inimigos.map((entidade) => ({ ...entidade, tipoRenderizacao: "inimigo" })),
  ];
  entidades.sort((a, b) => a.y - b.y);
  entidades.forEach((entidade) => {
    if (entidade.tipoRenderizacao === "inimigo") {
      this.inimigoR.desenhar(this.ctx, entidade);
    } else {
      this.jogadorR.desenhar(
        this.ctx,
        entidade,
        CORES_JOGADOR[entidade.slot % CORES_JOGADOR.length]
      );
    }
  });
  this.ctx.restore();
}

// A câmera segue o jogador com esse id. Se ele ainda não chegou do servidor,
// fica no centro do mapa por alguns frames.
calcularCamera(jogadores, meuId) {
  const eu = jogadores.find((j) => j.id === meuId);

  const centroX = eu ? eu.x + TAMANHO_JOGADOR / 2 : LARGURA / 2;
  const centroY = eu ? eu.y + TAMANHO_JOGADOR / 2 : ALTURA / 2;

  return {
    cameraX: Math.round(
      Math.max(0, Math.min(LARGURA - LARGURA_VIEWPORT, centroX - LARGURA_VIEWPORT / 2))
    ),
    cameraY: Math.round(
      Math.max(0, Math.min(ALTURA - ALTURA_VIEWPORT, centroY - ALTURA_VIEWPORT / 2))
    ),
  };
}
}
