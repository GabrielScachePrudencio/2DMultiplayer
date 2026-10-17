import { useCallback, useEffect, useRef, useState } from "react";
import CanvasJogo from "../pages/CanvasJogo";

import { WS_URL } from "../config";

export default function Sala({ codigo, onSair }) {
  const [presenca, setPresenca] = useState({ total: 0, max: 2 });
  const [erro, setErro] = useState(null);
  const wsRef = useRef(null);
  const jogadoresRef = useRef([]);

  const enviarInput = useCallback((dx, dy) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: "input", dx, dy }));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ tipo: "entrar", codigo }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.tipo === "sala:atualizada") {
        setPresenca({ total: msg.total, max: msg.max });
        setErro(null);
      } else if (msg.tipo === "estado") {
        jogadoresRef.current = msg.jogadores;
      } else if (msg.tipo === "erro") {
        setErro(msg.mensagem);
      }
    };

    ws.onclose = () => setErro((e) => e ?? "Conexão encerrada");

    return () => {
      ws.onclose = null;
      ws.close();
      jogadoresRef.current = [];
    };
  }, [codigo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#111", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 16px" }}>
        <button onClick={onSair}>← Voltar</button>
        <strong>Sala {codigo}</strong>
        {erro ? (
          <span style={{ color: "#ff6b6b" }}>{erro}</span>
        ) : (
          <span>
            {presenca.total}/{presenca.max} jogadores
            {presenca.total < presenca.max && " — aguardando outro jogador..."}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {!erro && <CanvasJogo jogadoresRef={jogadoresRef} onInput={enviarInput} />}
      </div>
    </div>
  );
}