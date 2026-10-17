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
      encerrado = true; // saída voluntária: não reconectar
      clearTimeout(timer);
      ws.close();
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
    <div style={{ padding: 24 }}>
      <h1>Salas</h1>
      <button onClick={handleCriar}>Criar sala</button>
      <button onClick={carregar}>Atualizar</button>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <ul>
        {salas.map((s) => {
          const online = contagens[s.codigo] ?? 0;
          const cheia = online >= s.capacidade;
          return (
            <li key={s.id}>
              {s.codigo} — {online}/{s.capacidade}{" "}
              <button onClick={() => onEntrar(s.codigo)} disabled={cheia}>
                {cheia ? "Cheia" : "Entrar"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}