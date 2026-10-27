import { useCallback, useEffect, useRef, useState } from "react";
import CanvasJogo from "../pages/CanvasJogo";
import PainelJogadores from "./PainelJogadores";
import { WS_URL } from "../config";

export default function Sala({ codigo, classe, onSair }) {
  const [presenca, setPresenca] = useState({ total: 0, max: 2 });
  const [erro, setErro] = useState(null);
  const wsRef = useRef(null);
  const jogadoresRef = useRef([]);
  const [infoJogadores, setInfoJogadores] = useState([]);

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
      ws.send(JSON.stringify({ tipo: "entrar", codigo, classeId: classe.id }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.tipo === "sala:atualizada") {
        setPresenca({ total: msg.total, max: msg.max });
        setInfoJogadores(msg.jogadores ?? []);
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
  }, [codigo, classe.id]);

  return (
    <div className="sala-tela">
      <div className="barra">
        <button className="btn btn-coral btn-pequeno" onClick={onSair}>Voltar</button>
        <span className="faixa faixa-mini">Sala {codigo}</span>
        {erro ? (
          <span className="aviso-erro inline">{erro}</span>
        ) : (
          <>
            <span className="badge badge-grande">{presenca.total}/{presenca.max} jogadores</span>
            {presenca.total < presenca.max && (
              <span className="espera">aguardando outro jogador...</span>
            )}
          </>
        )}
      </div>

      <PainelJogadores jogadores={infoJogadores} />

      <div className="moldura">
        {!erro && <CanvasJogo jogadoresRef={jogadoresRef} onInput={enviarInput} />}
      </div>
    </div>
  );
}
