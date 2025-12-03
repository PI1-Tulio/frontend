import './Header.css';
import { useSocketContext } from '../../context/SocketContext/useContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { batteryPercentage } = useSocketContext() || { batteryPercentage: null };

  return (
    <header className="header">
      <div className="header-content">
        <div className="left-section">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/deliveries">Entregas</Link>
          </nav>
        </div>

        <div className="right-section">
          <div className="battery-info">
            <div className="battery-container">
              <div
                className="battery-level"
                style={{ width: `${batteryPercentage ?? 0}%` }}
              ></div>
            </div>
            <span className="battery-percentage">{batteryPercentage !== null ? batteryPercentage + '%' : 'loading...'}</span>
          </div>

          <div className="time-info">

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
