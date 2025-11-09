import { useCallback, useEffect, useState } from 'react';
import './Header.css';
import { getBatteryInfo } from '../../api/espService';

const Header = () => {
  const [batteryPercentage, setBatteryPercentage] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  useEffect(() => {
    let timeoutId: number;
    let active = true;

    const fetchBattery = async () => {
      if (document.hidden) return; // não busca se aba não visível

      const { percentage, remainingSeconds } = await getBatteryInfo();

      if (active) {
        setBatteryPercentage(percentage);
        setTimeRemaining(remainingSeconds);
      }
    };

    const loop = async () => {
      await fetchBattery();
      timeoutId = setTimeout(loop, 5000);
    };

    loop();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(timeoutId);
      else loop();
    });

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const formattedTime = useCallback(() => {
    const hoursRemaining = Math.floor(timeRemaining / (60 * 60));
    const minutesRemaining = Math.floor((timeRemaining / 60)) % 60;
    const secondsRemaining = timeRemaining % 60;

    let formattedString = "";
    if (hoursRemaining) formattedString += `${hoursRemaining}h`;
    if (minutesRemaining) formattedString += `${minutesRemaining}m`;
    if (!hoursRemaining && secondsRemaining) formattedString += `${secondsRemaining}s`

    return formattedString;
  }, [timeRemaining])();

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
            <span className="time-remaining">{formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
