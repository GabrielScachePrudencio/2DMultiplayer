import { useState } from "react";
import "@fontsource/jersey-15/400.css";
import "./App.css";
import "./tema.css"; // depois dos outros css, para o tema prevalecer
import CodigoDaSala from "./pages/codigoDaSala";
import Sala from "./component/Sala";
import ModalClasses from "./component/ModalClasses";

function App() {
  const [salaPendente, setSalaPendente] = useState(null); // codigo da sala clicada
  const [entrada, setEntrada] = useState(null);           // { codigo, classe }

  if (entrada) {
    return (
      <Sala
        codigo={entrada.codigo}
        classe={entrada.classe}
        onSair={() => setEntrada(null)}
      />
    );
  }

  return (
    <>
      <CodigoDaSala onEntrar={setSalaPendente} />
      {salaPendente && (
        <ModalClasses
          codigoSala={salaPendente}
          onCancelar={() => setSalaPendente(null)}
          onEscolher={(classe) => {
            setEntrada({ codigo: salaPendente, classe });
            setSalaPendente(null);
          }}
        />
      )}
    </>
  );
}

export default App;
