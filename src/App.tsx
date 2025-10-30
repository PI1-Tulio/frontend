import { Routes, Route } from 'react-router-dom'
import Instrucao from './pages/instrucao/Instrucao';

function App() {
  return (
    <Routes>
      {<Route path="/" element={<Instrucao />} />}
    </Routes>
  )
}

export default App