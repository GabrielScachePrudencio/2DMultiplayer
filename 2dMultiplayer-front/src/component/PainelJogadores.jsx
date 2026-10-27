import { CORES_JOGADOR } from "../game/constantes";
import { urlSpriteDaClasse } from "../game/spritesClasses";

export default function PainelJogadores({ jogadores }) {
  return (
    <div className="jogadores">
      {jogadores.map((j) => {
        const sprite = j.classeId != null ? urlSpriteDaClasse(j.classeId) : null;
        return (
          <div
            key={j.id}
            className="jogador-card"
            style={{ "--cor-slot": CORES_JOGADOR[j.slot % CORES_JOGADOR.length] }}
          >
            {sprite && <img src={sprite} alt="" />}
            <div>
              <span className="jogador-nome">{j.classe}</span>
              <span className="jogador-stats">
                <span>Vida {j.vidaMax}</span>
                <span>Sorte {j.sorte}</span>
                <span>Dano F {j.danoFisico} / M {j.danoMagico}</span>
                <span>Def F {j.defesaFisica} / M {j.defesaMagica}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
