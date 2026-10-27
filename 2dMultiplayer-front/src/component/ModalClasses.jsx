import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { urlSpriteDaClasse } from "../game/spritesClasses";

export default function ModalClasses({ codigoSala, onEscolher, onCancelar }) {
  const [classes, setClasses] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/classes`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setClasses)
      .catch(() => setErro("Não consegui carregar as classes"));
  }, []);

  // Esc fecha o modal
  useEffect(() => {
    const aoTecla = (e) => e.key === "Escape" && onCancelar();
    window.addEventListener("keydown", aoTecla);
    return () => window.removeEventListener("keydown", aoTecla);
  }, [onCancelar]);

  return (
    <div className="modal-fundo" onClick={onCancelar}>
      <div
        className="painel modal"
        role="dialog"
        aria-modal="true"
        aria-label="Escolha sua classe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="faixa faixa-topo">Escolha sua classe</div>
        <p className="subtitulo">Sala <strong>{codigoSala}</strong></p>

        {erro && <p className="aviso-erro">{erro}</p>}

        <div className="cartas">
          {classes.map((c) => {
            const sprite = urlSpriteDaClasse(c.id);
            return (
              <button
                key={c.id}
                className={`carta ${selecionada?.id === c.id ? "selecionada" : ""}`}
                onClick={() => setSelecionada(c)}
              >
                {sprite && (
                  <img
                    src={sprite}
                    alt=""
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                )}
                <span className="carta-nome">{c.nome}</span>
                <span className="carta-stats">
                  <span>Vida <b>{c.vida}</b></span>
                  <span>Sorte <b>{c.sorte}</b></span>
                  <span>Dano F <b>{c.danoFisico}</b></span>
                  <span>Dano M <b>{c.danoMagico}</b></span>
                  <span>Def F <b>{c.defesaFisica}</b></span>
                  <span>Def M <b>{c.defesaMagica}</b></span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rodape-modal">
          <button className="btn btn-coral" onClick={onCancelar}>Cancelar</button>
          <button
            className="btn btn-menta"
            disabled={!selecionada}
            onClick={() => onEscolher(selecionada)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
