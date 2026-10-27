// Ligacao entre o id da classe (tabela "classes" no MySQL) e o arquivo do sprite.
// AJUSTE os ids da esquerda para os ids reais das suas classes.
export const SPRITE_POR_CLASSE_ID = {
  1: "classe_01.png",
  2: "classe_02.png",
  3: "classe_03.png",
  4: "classe_04.png",
  5: "classe_05.png",
  6: "classe_06.png",
  7: "classe_07.png",
  8: "classe_08.png",
  9: "classe_09.png",
  10: "classe_10.png",
};

export const TAMANHO_SPRITE = 32; // cada quadro tem 32x32 pixels

const PASTA = `${process.env.PUBLIC_URL || ""}/sprites/classes/`;

// carrega todas as imagens uma vez e devolve { idDaClasse: Image }
export function carregarSprites() {
  const imagens = {};
  for (const [id, arquivo] of Object.entries(SPRITE_POR_CLASSE_ID)) {
    const img = new Image();
    img.src = PASTA + arquivo;
    imagens[id] = img;
  }
  return imagens;
}

// endereco da imagem de uma classe (usado nos cartoes do modal e no painel); null se nao houver
export function urlSpriteDaClasse(id) {
  const arquivo = SPRITE_POR_CLASSE_ID[id];
  return arquivo ? PASTA + arquivo : null;
}
