import { useCallback, useEffect, useRef, useState } from "react";
import CanvasJogo from "../pages/CanvasJogo";
import PainelJogadores from "./PainelJogadores";
import { WS_URL } from "../config";

export default function Sala({ codigo, classe, onSair }) {
  const [presenca, setPresenca] = useState({ total: 0, max: null });
  const [erro, setErro] = useState(null);
  const wsRef = useRef(null);
  const jogadoresRef = useRef([]);
  const jogadorIdRef = useRef(null);
  const inimigosRef = useRef([]);
  const [infoJogadores, setInfoJogadores] = useState([]);

  const enviarInput = useCallback((dx, dy) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: "input", dx, dy }));
    }
  }, []);

  const enviarMira = useCallback((x, y) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: "mira", x, y }));
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
        jogadoresRef.current = msg.jogadores ?? [];
        jogadorIdRef.current = msg.meuId ?? jogadorIdRef.current;
        inimigosRef.current = msg.inimigos ?? [];
      } else if (msg.tipo === "erro") {
        setErro(msg.mensagem);
      }
    };

    ws.onclose = () => setErro((e) => e ?? "Conexão encerrada");

    return () => {
      ws.onclose = null;
      ws.close();
      jogadoresRef.current = [];
      jogadorIdRef.current = null;
      inimigosRef.current = [];
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
            {presenca.max != null && (
              <>
                <span className="badge badge-grande">{presenca.total}/{presenca.max} jogadores</span>
                {presenca.total < presenca.max && (
                  <span className="espera">aguardando outro jogador...</span>
                )}
              </>
            )}
          </>
        )}
      </div>

      <PainelJogadores jogadores={infoJogadores} />

      <div className="moldura">
        {!erro && (
          <CanvasJogo
            jogadoresRef={jogadoresRef}
            jogadorIdRef={jogadorIdRef}
            inimigosRef={inimigosRef}
            onInput={enviarInput}
            onMira={enviarMira}
          />
        )}
      </div>
    </div>
  );
}
