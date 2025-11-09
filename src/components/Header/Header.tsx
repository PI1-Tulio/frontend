import React from 'react';
import './Header.css';

interface HeaderProps {
  batteryPercentage?: number;
  timeRemaining?: string;
}

const Header: React.FC<HeaderProps> = ({
  batteryPercentage = 97,
  timeRemaining = '57m restantes'
}) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="left-section"></div>

        <div className="right-section">
          <div className="battery-info">
            <div className="battery-container">
              <div
                className="battery-level"
                style={{ width: `${batteryPercentage}%` }}
              ></div>
            </div>
            <span className="battery-percentage">{batteryPercentage}%</span>
          </div>

          <div className="time-info">
            <span className="time-remaining">{timeRemaining}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
