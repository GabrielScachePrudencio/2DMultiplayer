import { useState } from "react";
import './App.css';
import CodigoDaSala from './pages/codigoDaSala';
import Sala from "./component/Sala";

function App() {
  const [codigoAtual, setCodigoAtual] = useState(null);

  if (codigoAtual) {
    return <Sala codigo={codigoAtual} onSair={() => setCodigoAtual(null)} />;
  }

  return <CodigoDaSala onEntrar={setCodigoAtual} />;
}

export default App;