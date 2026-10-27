import { LARGURA, ALTURA, CORES_JOGADOR } from "../constantes";
import { carregarSprites } from "../spritesClasses";
import RenderizadorMapa from "./RenderizadorMapa";
import RenderizadorJogador from "./RenderizadorJogador";

export default class Renderizador {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false; // pixel nitido
    this.mapaR = new RenderizadorMapa();
    this.jogadorR = new RenderizadorJogador(carregarSprites());
  }

  desenhar(mapa, jogadores) {
    this.ctx.clearRect(0, 0, LARGURA, ALTURA);
    this.mapaR.desenhar(this.ctx, mapa);

    // quem esta mais embaixo na tela e desenhado por cima
    [...jogadores]
      .sort((a, b) => a.y - b.y)
      .forEach((j) =>
        this.jogadorR.desenhar(this.ctx, j, CORES_JOGADOR[j.slot % CORES_JOGADOR.length])
      );
  }
}
