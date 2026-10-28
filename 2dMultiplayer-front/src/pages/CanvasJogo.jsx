import { useEffect, useRef } from "react";
import { LARGURA_VIEWPORT, ALTURA_VIEWPORT } from "../game/constantes";
import { MAPA_TEXTO } from "../game/mapaDados";
import Mapa from "../game/Mapa";
import Teclado from "../game/Teclado";
import Renderizador from "../game/render/Renderizador";

export default function CanvasJogo({ jogadoresRef, inimigosRef, onInput, onMira }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const mapa = new Mapa(MAPA_TEXTO);
    const teclado = new Teclado();
    const renderizador = new Renderizador(ctx);

    let ultimoDx = 0, ultimoDy = 0;
    let raf;

    let mouseX = 0;
    let mouseY = 0;
    let mouseDentro = false;
    let ultimoEnvioMira = 0;

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

    function loop() {
      const { dx, dy } = teclado.direcao();
      const jogadores = jogadoresRef.current;
      const agora = performance.now();

      if (dx !== ultimoDx || dy !== ultimoDy) {
        onInput(dx, dy); // só avisa o servidor quando a direção muda
        ultimoDx = dx;
        ultimoDy = dy;
      }
      if (mouseDentro && agora - ultimoEnvioMira >= 33) {
        const { cameraX, cameraY } = renderizador.calcularCamera(jogadores);
        onMira(mouseX + cameraX, mouseY + cameraY);
        ultimoEnvioMira = agora;
      }
      renderizador.desenhar(mapa, jogadoresRef.current, inimigosRef.current);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      teclado.destruir();
      canvas.removeEventListener("mousemove", atualizarMouse);
      canvas.removeEventListener("mouseleave", sairDoCanvas);
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