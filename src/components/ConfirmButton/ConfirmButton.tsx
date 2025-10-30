import React from 'react';
import styles from './ConfirmButton.module.css';

import XIcon from '../../assets/icons/check-icon.svg';

interface ConfirmButtonProps {
  onClick: () => void;
}

export function ConfirmButton({ onClick }: ConfirmButtonProps) {
  return (
    <button className={styles.confirmButton} onClick={onClick}>
      <img
        src={XIcon}
        alt="Confirmar"
        className={styles.icon}
      />
    </button>
  );
}

export default ConfirmButton;