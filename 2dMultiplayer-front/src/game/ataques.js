// Como cada classe ataca. Só visual por enquanto.
// Troque as chaves (1, 2, 3) pelos classeId reais do seu banco.
export const ATAQUE_PADRAO = { tipo: "corpo", cooldownMs: 500, alcance: 34, arcoGraus: 110 };

export const ATAQUES_POR_CLASSE_ID = {
  1: { tipo: "corpo", cooldownMs: 500, alcance: 34, arcoGraus: 110 }, // guerreiro
  2: { tipo: "projetil", cooldownMs: 400, velocidade: 280, alcance: 240, raio: 3, cor: "#f5d56e" }, // arqueiro
  3: { tipo: "projetil", cooldownMs: 900, velocidade: 160, alcance: 200, raio: 6, cor: "#c58ad0" }, // mago
};

// Devolve a ficha de ataque da classe (ou o ataque padrão se a classe não estiver na tabela).
export function configDoAtaque(classeId) {
  return ATAQUES_POR_CLASSE_ID[classeId] || ATAQUE_PADRAO;
}

// Cria o ataque. Retorna null se ainda está em cooldown.
// origem e mira estão em coordenadas do MAPA (não da tela).
export function criarAtaque(config, origem, mira, agora, ultimoAtaque) {
  if (agora - ultimoAtaque < config.cooldownMs) return null;
  const angulo = Math.atan2(mira.y - origem.y, mira.x - origem.x); // Y primeiro!
  return { ...config, x: origem.x, y: origem.y, angulo, nascimento: agora, percorrido: 0, vivo: true };
}

// Chamada a cada frame: move os projéteis e apaga o que acabou.
export function atualizarAtaques(ataques, dt, agora) {
  for (const a of ataques) {
    if (a.tipo === "corpo") {
      if (agora - a.nascimento > 150) a.vivo = false; // o golpe dura 150 ms
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