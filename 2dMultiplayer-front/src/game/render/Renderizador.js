import { LARGURA, ALTURA } from "../constantes";
import RenderizadorMapa from "./RenderizadorMapa";
import RenderizadorJogador from "./RenderizadorJogador";

const CORES = ["#e74c3c", "#3498db"];

export default class Renderizador {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.mapaR = new RenderizadorMapa();
    this.jogadorR = new RenderizadorJogador();
  }

  desenhar(mapa, jogadores) {
    this.ctx.clearRect(0, 0, LARGURA, ALTURA);
    this.mapaR.desenhar(this.ctx, mapa);
    jogadores.forEach((j) => this.jogadorR.desenhar(this.ctx, j, CORES[j.slot % CORES.length]));
  }
}