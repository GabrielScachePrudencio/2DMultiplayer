export default class Teclado {
  constructor() {
    this.teclas = new Set();
    this.aoPressionar = (e) => this.teclas.add(e.key.toLowerCase());
    this.aoSoltar = (e) => this.teclas.delete(e.key.toLowerCase());
    this.aoPerderFoco = () => this.teclas.clear();
    window.addEventListener("keydown", this.aoPressionar);
    window.addEventListener("keyup", this.aoSoltar);
    window.addEventListener("blur", this.aoPerderFoco);
  }

  direcao() {
    let dx = 0, dy = 0;
    if (this.teclas.has("a")) dx -= 1;
    if (this.teclas.has("d")) dx += 1;
    if (this.teclas.has("w")) dy -= 1;
    if (this.teclas.has("s")) dy += 1;
    return { dx, dy };
  }

  destruir() {
    window.removeEventListener("keydown", this.aoPressionar);
    window.removeEventListener("keyup", this.aoSoltar);
    window.removeEventListener("blur", this.aoPerderFoco);
  }
}