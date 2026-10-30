import { API_URL } from "../config"; // AJUSTE: use o nome/caminho do seu config.js

// Forma de cada tipo do banco. O tipo "magia" desenha como projétil, mas é dano mágico.
const BASE = {
  corpo:    { tipo: "corpo",    magico: false, alcance: 34, arcoGraus: 110 },
  projetil: { tipo: "projetil", magico: false, velocidade: 280, alcance: 240, raio: 3, cor: "#f5d56e" },
  magia:    { tipo: "projetil", magico: true,  velocidade: 160, alcance: 200, raio: 6, cor: "#c58ad0" },
};

export const ATAQUE_PADRAO = { ...BASE.corpo, cooldownMs: 1000 };

let classesPorId = {};

// Chame uma vez ao montar o jogo.
export async function carregarClasses() {
  const resp = await fetch(`${API_URL}/classes`);
  const lista = await resp.json();
  classesPorId = Object.fromEntries(lista.map((c) => [c.id, c]));
}

// Monta a ficha de ataque a partir da linha da classe no banco.
export function configDoAtaque(classeId) {
  const c = classesPorId[classeId];
  if (!c) return ATAQUE_PADRAO; // classes ainda não carregaram
  const base = BASE[c.tipo] || BASE.corpo;
  const vel = c.velocidadeAtaque > 0 ? c.velocidadeAtaque : 1; // ataques por segundo
  return { ...base, cooldownMs: 1000 / vel };
}

// criarAtaque e atualizarAtaques continuam EXATAMENTE como estavam:
export function criarAtaque(config, origem, mira, agora, ultimoAtaque) {
  if (agora - ultimoAtaque < config.cooldownMs) return null;
  const angulo = Math.atan2(mira.y - origem.y, mira.x - origem.x);
  return { ...config, x: origem.x, y: origem.y, angulo, nascimento: agora, percorrido: 0, vivo: true };
}

export function atualizarAtaques(ataques, dt, agora) {
  for (const a of ataques) {
    if (a.tipo === "corpo") {
      if (agora - a.nascimento > 150) a.vivo = false;
    } else {
      const passo = a.velocidade * dt;
      a.x += Math.cos(a.angulo) * passo;
      a.y += Math.sin(a.angulo) * passo;
      a.percorrido += passo;
      if (a.percorrido >= a.alcance) a.vivo = false;
    }
  }
  return ataques.filter((a) => a.vivo);
}