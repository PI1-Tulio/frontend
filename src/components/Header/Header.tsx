import { useCallback, useEffect, useState } from 'react';
import './Header.css';
import { getBatteryInfo, getTimeElapsedAfterStartup } from '../../api/espService';

const Header = () => {
  const [batteryPercentage, setBatteryPercentage] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [timeFromStartup, setTimeFromStartup] = useState<number>(60);

  useEffect(() => {
    let timeoutId: number;
    let active = true;

    const fetchBattery = async () => {
      if (document.hidden) return; // não busca se aba não visível

      const { percentage, remainingSeconds } = await getBatteryInfo();
      const { elapsedSecondsAfterStartup } = await getTimeElapsedAfterStartup();

      if (active) {
        setBatteryPercentage(percentage);
        setTimeRemaining(remainingSeconds);
        setTimeFromStartup(elapsedSecondsAfterStartup);
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

  const formatTime = useCallback((seconds: number) => {
    const hoursRemaining = Math.floor(seconds / (60 * 60));
    const minutesRemaining = Math.floor((seconds / 60)) % 60;
    const secondsRemaining = seconds % 60;

    let formattedString = "";
    if (hoursRemaining) formattedString += `${hoursRemaining}h`;
    if (minutesRemaining) formattedString += `${minutesRemaining}m`;
    if (!hoursRemaining && secondsRemaining) formattedString += `${secondsRemaining}s`

    return formattedString;
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="left-section">
          <div className='time-info'>
            <span className="time-since-startup">
              {formatTime(timeFromStartup)} desde o início
            </span>
          </div>
        </div>

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
            <span className="time-remaining">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
