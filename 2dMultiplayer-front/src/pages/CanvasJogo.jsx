import { useEffect, useRef } from "react";
import { LARGURA_VIEWPORT, ALTURA_VIEWPORT, TAMANHO_JOGADOR } from "../game/constantes";
import { MAPA_TEXTO } from "../game/mapaDados";
import Mapa from "../game/Mapa";
import Teclado from "../game/Teclado";
import Renderizador from "../game/render/Renderizador";
import RenderizadorAtaque from "../game/render/RenderizadorAtaque";
import { configDoAtaque, criarAtaque, atualizarAtaques, carregarClasses } from "../game/ataques";
import RenderizadorIndicadores from "../game/render/RenderizadorIndicadores";

export default function CanvasJogo({
  jogadoresRef,
  inimigosRef,
  jogadorIdRef,
  onInput,
  onMira,
  onAtacar,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    carregarClasses().catch(console.error);
    const ctx = canvasRef.current.getContext("2d");
    const mapa = new Mapa(MAPA_TEXTO);
    const teclado = new Teclado();
    const renderizador = new Renderizador(ctx);
    const ataqueR = new RenderizadorAtaque();
    const indicadorR = new RenderizadorIndicadores();
    
    let ultimoDx = 0, ultimoDy = 0;
    let raf;

    let mouseX = 0;
    let mouseY = 0;
    let mouseDentro = false;
    let ultimoEnvioMira = 0;

    let ataques = [];
    let ultimoAtaque = -9999;
    let ultimoFrame = performance.now();

    function atacar() {
      const jogadores = jogadoresRef.current;
      const { cameraX, cameraY } = renderizador.calcularCamera(jogadores, jogadorIdRef.current);
      const mira = { x: mouseX + cameraX, y: mouseY + cameraY };
      onAtacar(mira.x, mira.y);

      const eu = jogadores.find((j) => j.id === jogadorIdRef.current);
      if (!eu) return;

      const agora = performance.now();
      const origem = {
        x: eu.x + TAMANHO_JOGADOR / 2,
        y: eu.y + TAMANHO_JOGADOR / 2,
      };

      const ataque = criarAtaque(configDoAtaque(eu.classeId), origem, mira, agora, ultimoAtaque);
      if (!ataque) return;
      ultimoAtaque = agora;
      ataques.push(ataque);
    }

    function aoClicar(event) {
      atualizarMouse(event);
      atacar();
    }

    function aoTecla(e) {
      if (e.key === " ") {
        e.preventDefault();
        atacar();
      }
    }

    const canvas = canvasRef.current;

    function atualizarMouse(event) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
      mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
      mouseDentro = true;
    }

    function sairDoCanvas() {
      mouseDentro = false;
    }

    canvas.addEventListener("mousemove", atualizarMouse);
    canvas.addEventListener("mouseleave", sairDoCanvas);
    canvas.addEventListener("mousedown", aoClicar);
    window.addEventListener("keydown", aoTecla);

    function loop() {
      const { dx, dy } = teclado.direcao();
      const jogadores = jogadoresRef.current;
      const agora = performance.now();
      const dt = Math.min((agora - ultimoFrame) / 1000, 0.05);
      ultimoFrame = agora;

      if (dx !== ultimoDx || dy !== ultimoDy) {
        onInput(dx, dy); // só avisa o servidor quando a direção muda
        ultimoDx = dx;
        ultimoDy = dy;
      }
      if (mouseDentro && agora - ultimoEnvioMira >= 33) {
      const { cameraX, cameraY } = renderizador.calcularCamera(jogadores, jogadorIdRef.current);        
         onMira(mouseX + cameraX, mouseY + cameraY);
        ultimoEnvioMira = agora;
      }
      renderizador.desenhar(mapa, jogadoresRef.current, inimigosRef.current, jogadorIdRef.current);
      ataques = atualizarAtaques(ataques, dt, agora);
      const { cameraX, cameraY } = renderizador.calcularCamera(jogadores, jogadorIdRef.current);
      ataqueR.desenhar(ctx, ataques, cameraX, cameraY, agora);
      indicadorR.desenhar(ctx, jogadores, jogadorIdRef.current, cameraX, cameraY);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      teclado.destruir();
      canvas.removeEventListener("mousemove", atualizarMouse);
      canvas.removeEventListener("mouseleave", sairDoCanvas);
      canvas.removeEventListener("mousedown", aoClicar);
      window.removeEventListener("keydown", aoTecla);
    };
  }, []); // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      width={LARGURA_VIEWPORT}
      height={ALTURA_VIEWPORT}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        imageRendering: "pixelated",
        background: "#000",
      }}
    />
  );
}