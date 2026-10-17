export default class Jogador {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.tamanho = 12;
    this.velocidade = 90; // pixels por segundo
  }

  mover(dx, dy, dt, mapa) {
    if (dx !== 0 && dy !== 0) { // diagonal não pode ser mais rápida
      dx *= 0.7071;
      dy *= 0.7071;
    }
    const passo = this.velocidade * dt;

    // eixos separados: assim o jogador "desliza" ao longo do muro
    const nx = this.x + dx * passo;
    if (!mapa.colide(nx, this.y, this.tamanho, this.tamanho)) this.x = nx;

    const ny = this.y + dy * passo;
    if (!mapa.colide(this.x, ny, this.tamanho, this.tamanho)) this.y = ny;
  }
}