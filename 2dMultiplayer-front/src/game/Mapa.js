import { TILE } from "./constantes";

export default class Mapa {
  constructor(linhasTexto) {
    this.grade = linhasTexto.map((l) => [...l].map((c) => (c === "#" ? 1 : 0)));
    this.linhas = this.grade.length;
    this.colunas = this.grade[0].length;
  }

  ehParede(col, lin) {
    // fora do mapa conta como parede
    if (lin < 0 || lin >= this.linhas || col < 0 || col >= this.colunas) return true;
    return this.grade[lin][col] === 1;
  }

  // um retângulo (x, y, largura, altura em pixels) encosta em algum muro?
  colide(x, y, w, h) {
    const c1 = Math.floor(x / TILE);
    const c2 = Math.floor((x + w - 1) / TILE);
    const l1 = Math.floor(y / TILE);
    const l2 = Math.floor((y + h - 1) / TILE);
    for (let l = l1; l <= l2; l++) {
      for (let c = c1; c <= c2; c++) {
        if (this.ehParede(c, l)) return true;
      }
    }
    return false;
  }
}