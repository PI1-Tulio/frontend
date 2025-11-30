import { Routes, Route } from 'react-router-dom'
import Instrucao from './pages/instrucao/Instrucao';
import Header from './components/Header/Header';
import { Delivery } from './pages/delivery/Delivery';
import { SocketProvider } from './context/SocketContext/Provider';
import { Deliveries } from './pages/deliveries/Deliveries';

function App() {
  return (
    <SocketProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Instrucao />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/delivery/:id" element={<Delivery />} />
      </Routes>
    </SocketProvider>
  )
}

export default App