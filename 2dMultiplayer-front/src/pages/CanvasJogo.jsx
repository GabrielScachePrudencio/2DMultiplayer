import { useEffect, useRef } from "react";
import { LARGURA, ALTURA } from "../game/constantes";
import { MAPA_TEXTO } from "../game/mapaDados";
import Mapa from "../game/Mapa";
import Teclado from "../game/Teclado";
import Renderizador from "../game/render/Renderizador";

export default function CanvasJogo({ jogadoresRef, onInput }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const mapa = new Mapa(MAPA_TEXTO);
    const teclado = new Teclado();
    const renderizador = new Renderizador(ctx);

    let ultimoDx = 0, ultimoDy = 0;
    let raf;

    function loop() {
      const { dx, dy } = teclado.direcao();
      if (dx !== ultimoDx || dy !== ultimoDy) {
        onInput(dx, dy); // só avisa o servidor quando a direção muda
        ultimoDx = dx;
        ultimoDy = dy;
      }
      renderizador.desenhar(mapa, jogadoresRef.current);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      teclado.destruir();
    };
  }, []); // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      width={LARGURA}
      height={ALTURA}
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