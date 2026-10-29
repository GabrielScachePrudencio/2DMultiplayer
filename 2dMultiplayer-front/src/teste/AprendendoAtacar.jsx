import { useEffect, useRef, useState } from "react";

/* =====================================================================
   AULA: COMO FAZER UM PERSONAGEM ATACAR
   =====================================================================

   COMO USAR ESTE ARQUIVO
   ----------------------
   1. Leia de cima para baixo. Cada "AULA" explica uma ideia e logo abaixo
      vem a função que a coloca em prática.
   2. Para ver rodando, no App.js coloque no começo do componente:

         import AprendendoAtacar from "./aula/aprendendoAtacar";
         if (window.location.hash === "#aula") return <AprendendoAtacar />;

      e abra  http://localhost:3000/#aula
      (WASD anda, mouse mira, clique ou Espaço ataca)
   3. No fim do arquivo estão os EXERCÍCIOS. O Exercício 1 está dentro do
      código (procure por "EXERCÍCIO 1"). O gabarito fica no final: só olhe
      depois de tentar.

   AULA 0: O NOME DO COMPONENTE
   ----------------------------
   Você começou com  export default function aprendendoAtacar() {}
   No React, componente que vira tag (<Isso />) PRECISA começar com letra
   maiúscula. Com minúscula o React acha que é uma tag HTML e não renderiza.
   Por isso aqui o nome é AprendendoAtacar.


   AULA 1: PENSAR ANTES DE CODAR
   -----------------------------
   "Atacar" parece uma coisa só, mas são 4 perguntas, sempre nesta ordem:

     1. PODE atacar agora?            -> cooldown (tempo entre ataques)
     2. PARA ONDE o ataque vai?       -> a direção da mira
     3. QUEM foi atingido?            -> geometria (colisão)
     4. QUANTO de dano e o que muda?  -> fórmula de dano e vida

   E uma regra de ouro do multiplayer, a mesma que já usamos no movimento:

     O CLIENTE SÓ PEDE. O SERVIDOR DECIDE.

   O navegador manda "quero atacar" e nada mais. Nunca "acertei o goblin,
   tirei 50 de dano". Quem confere cooldown, acerto e dano é o servidor.
   Se o cliente decidisse, qualquer um abriria o console e ganharia sempre.

   Neste arquivo tudo roda no navegador para você VER cada passo. Mas as
   funções foram escritas "puras" (só números entram e saem, nada de
   canvas) justamente para você levá-las para o Java quase sem mudar.

   Você já tem metade da aula pronta: o seu jogo já calcula o anguloMira
   no servidor. A pergunta 2 está respondida.
   ===================================================================== */

// ---------------------------------------------------------------------
// FICHAS DAS CLASSES (no jogo real, estes números vêm do MySQL)
// ---------------------------------------------------------------------
// tipo "corpo"    -> golpe em arco na frente do personagem
// tipo "projetil" -> cria um objeto que voa e acerta quem estiver no caminho
const CLASSES = {
  guerreiro: { nome: "Guerreiro", tipo: "corpo", cooldownMs: 500, alcance: 30, arcoGraus: 110, dano: 12, fisico: true },
  arqueiro: { nome: "Arqueiro", tipo: "projetil", cooldownMs: 400, velocidade: 280, alcance: 240, raio: 3, dano: 8, fisico: true },
  mago: { nome: "Mago", tipo: "projetil", cooldownMs: 900, velocidade: 160, alcance: 200, raio: 6, dano: 14, fisico: false },
};

const SORTE_DO_JOGADOR = 3; // no jogo vem de classe.getSorte()
const LARG = 640;
const ALT = 360;

/* =====================================================================
   AULA 2: COOLDOWN (pergunta 1: posso atacar agora?)
   =====================================================================
   Guardamos o MOMENTO do último ataque. Pode atacar se já passou tempo
   suficiente desde então:

        agora - ultimoAtaque >= cooldown

   Tempo em MILISSEGUNDOS. Sem isso o jogador seguraria o botão e atacaria
   30 vezes por segundo (a velocidade do tick).

   No Java:  System.currentTimeMillis()  faz o papel do "agora".
   ===================================================================== */
export function podeAtacar(agora, ultimoAtaque, cooldownMs) {
  return agora - ultimoAtaque >= cooldownMs;
}

/* =====================================================================
   AULA 3: DIREÇÃO (pergunta 2: para onde?)
   =====================================================================
   A direção é o ÂNGULO entre o personagem e o ponto da mira:

        ângulo = atan2( mira.y - origem.y ,  mira.x - origem.x )

   CUIDADO, erro número 1 de quem começa: atan2 recebe Y PRIMEIRO, depois X.

   Com o ângulo você tira o vetor de direção:
        andaEmX = cos(ângulo)      andaEmY = sin(ângulo)

   Também precisamos comparar dois ângulos ("o alvo está dentro do leque?").
   Subtrair direto dá errado na virada do círculo: 359° e 1° estão a 2° de
   distância, não a 358°. O truque atan2(sin, cos) devolve sempre a menor
   diferença, entre -PI e +PI.
   ===================================================================== */
export function anguloDaMira(origem, mira) {
  return Math.atan2(mira.y - origem.y, mira.x - origem.x);
}

export function diferencaAngular(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/* =====================================================================
   AULA 4: ACERTAR (pergunta 3: quem foi atingido?)
   =====================================================================
   Existem duas famílias de ataque, e a diferença entre elas é o TEMPO.

   4A. CORPO A CORPO: o acerto acontece NA HORA, em um único instante.
       A área do golpe é um "pedaço de pizza" na frente do personagem.
       O alvo está dentro se as DUAS coisas forem verdade:
         a) está perto o bastante      -> distância <= alcance
         b) está dentro do leque       -> diferença de ângulo <= metade do arco
       Subtraímos o raio do alvo da distância: assim encostar na borda dele
       já conta, e não só acertar o centro.
   ===================================================================== */
export function acertouGolpe(origem, angulo, alvo, alcance, arcoGraus) {
  const dx = alvo.x - origem.x;
  const dy = alvo.y - origem.y;

  const distanciaAteBorda = Math.hypot(dx, dy) - alvo.raio;
  if (distanciaAteBorda > alcance) return false; // longe demais

  const anguloAteAlvo = Math.atan2(dy, dx);
  const meioArco = ((arcoGraus / 2) * Math.PI) / 180; // graus -> radianos
  return Math.abs(diferencaAngular(anguloAteAlvo, angulo)) <= meioArco;
}

/* ---------------------------------------------------------------------
   4B. PROJÉTIL: o acerto ACONTECE DEPOIS. O ataque cria uma coisa nova no
   jogo (a flecha, a bola de fogo) que tem posição e velocidade, como um
   jogador, e é movida a cada tick:

        posição += velocidade * dt          (dt = tempo do tick, em segundos)

   A cada tick perguntamos duas coisas: acabou o alcance? bateu em alguém?
   Para saber se bateu, tratamos projétil e alvo como círculos: encostam
   quando a distância entre os centros é menor que a soma dos raios.

   (Nota avançada: se o projétil for MUITO rápido, em um tick ele pode
   pular por cima de um alvo fino sem nunca "encostar". É o "tunneling".
   Veja o Exercício 5.)
   --------------------------------------------------------------------- */
export function criarProjetil(origem, angulo, classe) {
  return {
    x: origem.x,
    y: origem.y,
    vx: Math.cos(angulo) * classe.velocidade, // px por segundo
    vy: Math.sin(angulo) * classe.velocidade,
    percorrido: 0,
    alcance: classe.alcance,
    raio: classe.raio,
    dano: classe.dano,
    fisico: classe.fisico,
    cor: classe.fisico ? "#f5d56e" : "#c58ad0",
    vivo: true,
  };
}

export function moverProjetil(p, dt) {
  const passoX = p.vx * dt;
  const passoY = p.vy * dt;
  p.x += passoX;
  p.y += passoY;
  p.percorrido += Math.hypot(passoX, passoY);
  if (p.percorrido >= p.alcance) p.vivo = false; // acabou o alcance
}

export function projetilAcertou(p, alvo) {
  return Math.hypot(alvo.x - p.x, alvo.y - p.y) <= alvo.raio + p.raio;
}

/* =====================================================================
   AULA 5: DANO (pergunta 4: quanto?)
   =====================================================================
   A fórmula mais simples que funciona bem:

        dano final = dano do ataque - defesa do alvo     (mínimo 1)

   O "mínimo 1" evita dano zero ou NEGATIVO (que curaria o alvo!).

   O seu banco já separa FÍSICO e MÁGICO. Ataque físico enfrenta a defesa
   física; ataque mágico enfrenta a mágica. Por isso o Mago "fura" um alvo
   cheio de armadura. Isso cria estratégia sem nenhuma regra extra.

   A SORTE entra como chance de CRÍTICO (dano dobrado). O sorteio
   (Math.random) tem que acontecer SÓ NO SERVIDOR, senão o cliente escolhe
   o "sorteio" que quiser.
   ===================================================================== */
export function calcularDano(danoDoAtaque, defesa) {
  return Math.max(1, danoDoAtaque - defesa);
}

// ---------------------------------------------------------------------
// EXERCÍCIO 1 (a sua vez!)
// Faça esta função devolver true com chance proporcional à sorte.
//   - Sorte 0  -> nunca é crítico
//   - Sorte 3  -> 15% de chance (5% por ponto de sorte)
// Dica: Math.random() devolve um número entre 0 e 1.
// Quando acertar, o log do laboratório passa a mostrar "CRÍTICO x2".
// ---------------------------------------------------------------------
export function ehCritico(sorte) {
  const chance = Math.random() * 100 + 1;

  if(chance <= sorte) {
    console.log("CRÍTICO x2");
    return true;
  } else {
    console.log("DANO NORMAL");
    return false;
  }
  
}

/* =====================================================================
   AULA 6: COMO ISSO VIRA MULTIPLAYER E JAVA
   =====================================================================
   Antes de tudo, um conserto no seu SalaWebSocketHandler (dentro do tick):

        "vida", j.getVida(), "vidaMax", j.getVida()        <- ERRADO
        "vida", j.getVida(), "vidaMax", j.getVidaMax()     <- CERTO

   Do jeito antigo a barra de vida NUNCA diminui, porque vida e vidaMax
   são sempre o mesmo número. Sem esse conserto você não verá o dano.

   A CONVERSA (mensagens JSON):

     front -> back   { "tipo": "atacar" }
        (sem x, sem y, sem dano. A direção o servidor já tem: anguloMira)

     back -> front   dentro do "estado" que já sai 30x por segundo:
        "projeteis": [ { "x":.., "y":.., "cor":".." } ]
        "inimigos":  [ ... com a vida atualizada ... ]
        "jogadores": [ ... com a vida atualizada ... ]
        "efeitos":   [ { "tipo":"golpe", "x":.., "y":.., "angulo":.. } ]
        (efeitos são coisas de UM tick só, para o front desenhar o golpe
         e o número de dano flutuando)

   O QUE FAZER NO JAVA (nesta ordem, testando cada passo):

     1. Banco/Classes: acrescente colunas para o ataque de cada classe,
        por exemplo tipo_ataque ("corpo" ou "projetil"), cooldown_ms,
        alcance, arco_graus, velocidade_projetil.
        Os dados da classe passam a descrever COMO ela ataca.

     2. Jogador.java: guarde  long ultimoAtaqueMs  e crie
            boolean podeAtacar(long agoraMs, long cooldownMs)
        (é a função podeAtacar daqui, escrita em Java).

     3. handleTextMessage: um novo  else if ("atacar".equals(tipo))
        que acha o Jogador da sessão e chama  atacar(jogador, codigoDaSala).

     4. atacar(): confere o cooldown (se não pode, IGNORA em silêncio),
        grava o momento e, conforme o tipo da classe:
          - corpo   -> roda acertouGolpe contra cada alvo da sala
          - projetil-> cria um Projetil e coloca numa lista da sala

     5. tick(): move todos os projéteis (moverProjetil), testa colisão com
        alvos (projetilAcertou) e também com PAREDES (mapaJogo.colide),
        remove os que acabaram e aplica o dano com calcularDano.

     6. Vida: quando vida <= 0 o jogador "morre". Decida o que acontece
        (respawn? fim da partida?). Comece simples: volta ao spawn com vida
        cheia.

   ATENÇÃO com o seu InimigoInfo: se ele for um "record" (imutável), não
   dá para diminuir a vida dele. Crie no servidor uma classe Inimigo normal
   (mutável) e transforme em InimigoInfo só na hora de enviar ao front.

   LIMITE DO Map.of: aceita no máximo 10 pares chave/valor. O jogador do
   "estado" já tem 8. Ao acrescentar campos, passe para um record
   (como você fez com JogadorInfo) em vez de seguir no Map.of.
   ===================================================================== */

/* =====================================================================
   O LABORATÓRIO (para VER cada aula funcionando)
   =====================================================================
   Repare que o estado do jogo fica num useRef (não useState): ele muda 60
   vezes por segundo e não queremos redesenhar o React a cada vez. É a
   mesma ideia do jogadoresRef no seu jogo.
   ===================================================================== */
function novoGoblin() {
  return { x: 260, y: 180, raio: 9, vida: 100, vidaMax: 100, defesaFisica: 3, defesaMagica: 1, piscarAte: 0 };
}

function desenhar(ctx, s, agora) {
  const c = CLASSES[s.classe];
  const angulo = anguloDaMira(s.jogador, s.mira);
  const { x: px, y: py } = s.jogador;

  // chão e grade
  ctx.fillStyle = "#6fae5a";
  ctx.fillRect(0, 0, LARG, ALT);
  ctx.strokeStyle = "rgba(0,0,0,.08)";
  for (let gx = 0; gx <= LARG; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ALT); ctx.stroke(); }
  for (let gy = 0; gy <= ALT; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(LARG, gy); ctx.stroke(); }

  // área de acerto (AULA 4): o "pedaço de pizza" ou o alcance do tiro
  if (s.mostrarAreas) {
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    if (c.tipo === "corpo") {
      const meio = ((c.arcoGraus / 2) * Math.PI) / 180;
      ctx.moveTo(px, py);
      ctx.arc(px, py, c.alcance + 9, angulo - meio, angulo + meio); // +9 = raio do goblin
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.setLineDash([4, 4]);
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(angulo) * c.alcance, py + Math.sin(angulo) * c.alcance);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // clarão do golpe (dura 150 ms)
  if (s.golpe && agora < s.golpe.ate) {
    const meio = ((c.arcoGraus / 2) * Math.PI) / 180;
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, c.alcance + 9, s.golpe.angulo - meio, s.golpe.angulo + meio);
    ctx.closePath();
    ctx.fill();
  }

  // goblin (alvo de treino)
  const g = s.goblin;
  ctx.fillStyle = agora < g.piscarAte ? "#ffffff" : "#3b7a2e";
  ctx.strokeStyle = "#0d0c13";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.raio, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.fillRect(g.x - 16, g.y - g.raio - 10, 32, 5);
  ctx.fillStyle = "#e27555";
  ctx.fillRect(g.x - 15, g.y - g.raio - 9, Math.max(0, 30 * (g.vida / g.vidaMax)), 3);

  // projéteis
  for (const p of s.projeteis) {
    ctx.fillStyle = p.cor;
    ctx.strokeStyle = "#0d0c13";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.raio + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // jogador (o quadrado de 12px é a hitbox) + linha da mira
  ctx.fillStyle = "#337da4";
  ctx.fillRect(px - 6, py - 6, 12, 12);
  ctx.strokeStyle = "#f5d56e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(angulo) * 18, py + Math.sin(angulo) * 18);
  ctx.stroke();

  // barra de cooldown embaixo do jogador (AULA 2)
  const pct = Math.min(1, (agora - s.ultimoAtaque) / c.cooldownMs);
  ctx.fillStyle = "#000";
  ctx.fillRect(px - 13, py + 10, 26, 5);
  ctx.fillStyle = pct >= 1 ? "#a6ddb8" : "#e27555";
  ctx.fillRect(px - 12, py + 11, 24 * pct, 3);

  // mira do mouse
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(s.mira.x - 5, s.mira.y); ctx.lineTo(s.mira.x + 5, s.mira.y);
  ctx.moveTo(s.mira.x, s.mira.y - 5); ctx.lineTo(s.mira.x, s.mira.y + 5);
  ctx.stroke();

  // números de dano flutuando
  s.textos = s.textos.filter((t) => agora < t.ate);
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  for (const t of s.textos) {
    const sobe = (1 - (t.ate - agora) / 700) * 24;
    ctx.fillStyle = t.critico ? "#ffd166" : "#ffffff";
    ctx.strokeStyle = "#0d0c13";
    ctx.lineWidth = 3;
    ctx.strokeText(t.texto, t.x, t.y - 14 - sobe);
    ctx.fillText(t.texto, t.x, t.y - 14 - sobe);
  }
}

export default function AprendendoAtacar() {
  const canvasRef = useRef(null);
  const sim = useRef({
    classe: "guerreiro",
    mostrarAreas: true,
    jogador: { x: 100, y: 180 }, // aqui x,y é o CENTRO (no jogo real é o canto: centro = x + 6)
    mira: { x: 300, y: 180 },
    goblin: novoGoblin(),
    projeteis: [],
    ultimoAtaque: -99999,
    golpe: null,
    textos: [],
  });
  const [classe, setClasse] = useState("guerreiro");
  const [mostrarAreas, setMostrarAreas] = useState(true);
  const [log, setLog] = useState(["Mire no goblin e clique (ou Espaço)."]);

  useEffect(() => { sim.current.classe = classe; }, [classe]);
  useEffect(() => { sim.current.mostrarAreas = mostrarAreas; }, [mostrarAreas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const s = sim.current;
    const teclas = new Set();
    const anotar = (msg) => setLog((l) => [msg, ...l].slice(0, 7));

    // AULA 5: o que acontece quando um ataque acerta o goblin
    function aplicarDano(ataque, agora) {
      const g = s.goblin;
      const defesa = ataque.fisico ? g.defesaFisica : g.defesaMagica;
      const base = calcularDano(ataque.dano, defesa);
      const critico = ehCritico(SORTE_DO_JOGADOR);
      const dano = critico ? base * 2 : base;

      g.vida -= dano;
      g.piscarAte = agora + 120;
      s.textos.push({ x: g.x, y: g.y - g.raio, texto: `-${dano}`, critico, ate: agora + 700 });
      anotar(
        `ACERTOU: dano ${ataque.dano} - defesa ${defesa} = ${base}` +
          (critico ? "  -> CRÍTICO x2 = " + dano : "") +
          `  (vida do goblin: ${Math.max(0, g.vida)})`
      );

      if (g.vida <= 0) {
        anotar("Goblin derrotado! Outro apareceu em outro lugar.");
        s.goblin = novoGoblin();
        s.goblin.x = 180 + Math.random() * 400;
        s.goblin.y = 50 + Math.random() * 260;
      }
    }

    // A função que junta as 4 perguntas da AULA 1
    function atacar() {
      const c = CLASSES[s.classe];
      const agora = performance.now();

      // pergunta 1: posso?
      if (!podeAtacar(agora, s.ultimoAtaque, c.cooldownMs)) {
        const faltam = Math.ceil(c.cooldownMs - (agora - s.ultimoAtaque));
        anotar(`RECUSADO: cooldown (faltam ${faltam} ms)`);
        return;
      }
      s.ultimoAtaque = agora;

      // pergunta 2: para onde?
      const angulo = anguloDaMira(s.jogador, s.mira);

      if (c.tipo === "corpo") {
        s.golpe = { angulo, ate: agora + 150 };
        // pergunta 3: quem? (instantâneo)
        if (acertouGolpe(s.jogador, angulo, s.goblin, c.alcance, c.arcoGraus)) aplicarDano(c, agora);
        else anotar("Golpe no ar: o goblin estava fora do alcance ou do leque.");
      } else {
        // pergunta 3 fica para os próximos ticks: o projétil vai voar
        s.projeteis.push(criarProjetil(s.jogador, angulo, c));
        anotar(`Disparou (${c.nome}). Se acertar, o dano aparece quando chegar.`);
      }
    }

    function aoMoverMouse(e) {
      const r = canvas.getBoundingClientRect();
      s.mira.x = (e.clientX - r.left) * (LARG / r.width);
      s.mira.y = (e.clientY - r.top) * (ALT / r.height);
    }
    function aoTeclaBaixo(e) {
      const k = e.key.toLowerCase();
      if (k === " ") { e.preventDefault(); atacar(); }
      else teclas.add(k);
    }
    const aoTeclaCima = (e) => teclas.delete(e.key.toLowerCase());

    canvas.addEventListener("mousemove", aoMoverMouse);
    canvas.addEventListener("mousedown", atacar);
    window.addEventListener("keydown", aoTeclaBaixo);
    window.addEventListener("keyup", aoTeclaCima);

    let raf;
    let ultimo = performance.now();
    function loop(agora) {
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;

      // mover o jogador (WASD)
      let dx = (teclas.has("d") ? 1 : 0) - (teclas.has("a") ? 1 : 0);
      let dy = (teclas.has("s") ? 1 : 0) - (teclas.has("w") ? 1 : 0);
      if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      s.jogador.x = Math.min(LARG - 10, Math.max(10, s.jogador.x + dx * 120 * dt));
      s.jogador.y = Math.min(ALT - 10, Math.max(10, s.jogador.y + dy * 120 * dt));

      // AULA 4B: mover cada projétil e ver se bateu
      for (const p of s.projeteis) {
        moverProjetil(p, dt);
        if (p.vivo && projetilAcertou(p, s.goblin)) {
          p.vivo = false;
          aplicarDano(p, agora);
        }
      }
      s.projeteis = s.projeteis.filter((p) => p.vivo);

      desenhar(ctx, s, agora);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", aoMoverMouse);
      canvas.removeEventListener("mousedown", atacar);
      window.removeEventListener("keydown", aoTeclaBaixo);
      window.removeEventListener("keyup", aoTeclaCima);
    };
  }, []);

  const c = CLASSES[classe];
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, color: "#fff" }}>
      <h1 style={{ margin: "0 0 4px" }}>Aula: como atacar</h1>
      <p style={{ margin: "0 0 12px", opacity: 0.8 }}>
        WASD anda · mouse mira · clique ou Espaço ataca. O código comentado está em aprendendoAtacar.jsx.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(CLASSES).map(([id, cls]) => (
          <button
            key={id}
            className={`btn btn-pequeno ${classe === id ? "btn-menta" : ""}`}
            onClick={() => setClasse(id)}
          >
            {cls.nome}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={LARG}
        height={ALT}
        style={{ display: "block", width: "100%", border: "4px solid #0d0c13", borderRadius: 8, cursor: "crosshair" }}
      />

      <label style={{ display: "block", margin: "12px 0" }}>
        <input type="checkbox" checked={mostrarAreas} onChange={(e) => setMostrarAreas(e.target.checked)} />{" "}
        mostrar áreas de acerto
      </label>

      <p style={{ margin: "0 0 8px", opacity: 0.85 }}>
        {c.nome}: {c.tipo === "corpo" ? `golpe em arco de ${c.arcoGraus}°, alcance ${c.alcance}` : `projétil, velocidade ${c.velocidade}, alcance ${c.alcance}`}
        {" · "}cooldown {c.cooldownMs} ms · dano {c.dano} {c.fisico ? "físico" : "mágico"}
      </p>

      <ul style={{ margin: 0, padding: "10px 14px", listStyle: "none", background: "rgba(0,0,0,.45)", borderRadius: 6, minHeight: 150 }}>
        {log.map((linha, i) => (
          <li key={i} style={{ opacity: 1 - i * 0.11, fontSize: 16 }}>{linha}</li>
        ))}
      </ul>
    </div>
  );
}

/* =====================================================================
   EXERCÍCIOS (do mais fácil ao mais difícil)
   =====================================================================

   1. (no código) Implemente ehCritico(sorte). Teste: deixe o Arqueiro
      atirando e veja o "CRÍTICO x2" aparecer de vez em quando.

   2. Mude o cooldown do Guerreiro para 200 e depois para 1500. Qual
      deixa o jogo melhor? Esse número é "balanceamento": a parte mais
      divertida (e difícil) de um jogo de classes.

   3. Mude o arco do Guerreiro para 360. Ele passa a acertar atrás de si.
      Agora para 20. O que muda na tática de quem joga com ele?

   4. Pergunta de prova: em acertouGolpe, o que acontece se o alvo estiver
      EXATAMENTE em cima do jogador (dx = 0 e dy = 0)? Que ângulo o atan2
      devolve? O golpe acerta? Isso é um bug ou um comportamento aceitável?

   5. (desafio) Tunneling. Aumente a velocidade do Arqueiro para 5000 e
      diminua o raio do goblin para 2. Os tiros passam direto. Por quê?
      Pense em duas soluções:
        a) dividir o movimento do tick em pedaços menores, testando a
           colisão em cada pedaço;
        b) testar o SEGMENTO entre a posição antiga e a nova contra o alvo.

   6. (desafio) Faça o projétil sumir ao bater numa parede. No seu jogo
      isso é uma linha: mapaJogo.colide(x, y, 1, 1) dentro do tick. Aqui
      invente uma parede (um retângulo) e teste.

   7. (desafio) Empurrão: ao acertar, empurre o goblin 20 pixels na
      direção do ataque. Dica: você já tem cos(ângulo) e sin(ângulo).


   =====================================================================
   GABARITO (só olhe depois de tentar!)
   =====================================================================

   Exercício 1:

       export function ehCritico(sorte) {
         return Math.random() < sorte * 0.05;
       }

   Exercício 4: atan2(0, 0) devolve 0 (aponta para a direita). Então o
   golpe só acerta se o jogador estiver mirando para a direita (dentro do
   arco). Na prática o alvo nunca fica exatamente no centro (as hitboxes
   se empurram), mas um "if (distancia === 0) return true" deixa a regra
   explícita.

   Exercício 5: a cada tick o projétil anda velocidade * dt. A 5000 px/s e
   com 30 ticks por segundo são ~166 px por tick: ele "teletransporta" por
   cima do alvo. Solução (a): em moverProjetil, ande em 5 passos de dt/5 e
   teste projetilAcertou em cada um.

   Exercício 7:

       g.x += Math.cos(angulo) * 20;
       g.y += Math.sin(angulo) * 20;

   (dentro de aplicarDano, mas lá você precisa receber o ângulo do ataque)
   ===================================================================== */