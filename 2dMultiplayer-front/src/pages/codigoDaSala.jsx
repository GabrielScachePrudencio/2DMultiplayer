import { API_URL, LOBBY_WS_URL } from "../config";
import { useEffect, useState } from "react";

export async function listarSalas() {
  const res = await fetch(`${API_URL}/salas`);
  if (!res.ok) throw new Error("Erro ao buscar salas");
  return res.json();
}

export async function criarSala() {
  const res = await fetch(`${API_URL}/salas`, { method: "POST" });
  if (!res.ok) throw new Error("Erro ao criar sala");
  return res.json();
}

export default function CodigoDaSala({ onEntrar }) {
  const [salas, setSalas] = useState([]);
  const [contagens, setContagens] = useState({}); // { codigo: quantidade }
  const [erro, setErro] = useState(null);

  async function carregar() {
    try {
      setSalas(await listarSalas());
      setErro(null);
    } catch (e) {
      setErro("Não consegui falar com o servidor");
    }
  }

  // lista de salas (REST), uma vez ao abrir a tela
  useEffect(() => {
    carregar();
  }, []);

  // contagem ao vivo (WebSocket)
  useEffect(() => {
    let ws;
    let timer;
    let encerrado = false;

    function conectar() {
      ws = new WebSocket(LOBBY_WS_URL);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.tipo === "lobby:contagem") {
          setContagens(msg.contagens);
        } else if (msg.tipo === "lobby:salas-mudaram") {
          carregar(); // sala nova: busca a lista de novo
        }
      };

      ws.onclose = () => {
        // se caiu sem querer, tenta de novo em 2s
        if (!encerrado) timer = setTimeout(conectar, 2000);
      };
    }

    conectar();

    return () => {
      encerrado = true; // saida voluntaria: nao reconectar
      clearTimeout(timer);
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close(); // ainda conectando: fecha assim que abrir
      } else {
        ws.close();
      }
    };
  }, []);

  async function handleCriar() {
    try {
      await criarSala();
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="tela">
      <div className="painel painel-menu">
        <div className="faixa faixa-topo">Salas</div>

        <div className="acoes">
          <button className="btn btn-menta" onClick={handleCriar}>Criar sala</button>
          <button className="btn" onClick={carregar}>Atualizar</button>
        </div>

        {erro && <p className="aviso-erro">{erro}</p>}
        {!erro && salas.length === 0 && (
          <p className="vazio">Nenhuma sala ainda. Crie a primeira!</p>
        )}

        <ul className="lista-salas">
          {salas.map((s) => {
            const online = contagens[s.codigo] ?? 0;
            const capacidade = Number(s.capacidade) || 0;
            const cheia = capacidade > 0 && online >= capacidade;
            const estado = cheia ? "cheia" : online > 0 ? "parcial" : "vazia";
            return (
              <li key={s.id} className={`sala ${estado}`}>
                <span className="sala-codigo">{s.codigo}</span>
                <span className="pips" aria-label={`${online} de ${capacidade} jogadores`}>
                  {Array.from({ length: capacidade }, (_, i) => (
                    <span key={i} className={`pip ${i < online ? "ocupado" : ""}`} />
                  ))}
                </span>
                <span className="badge">{online}/{capacidade}</span>
                <button
                  className="btn btn-vinho btn-pequeno"
                  onClick={() => onEntrar(s.codigo)}
                  disabled={cheia}
                >
                  {cheia ? "Cheia" : "Entrar"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
