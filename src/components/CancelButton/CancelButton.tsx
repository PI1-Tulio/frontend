import React from 'react';
import styles from './CancelButton.module.css';

import XIcon from '../../assets/icons/x-icon.svg';

interface CancelButtonProps {
  onClick: () => void;
}

export function CancelButton({ onClick }: CancelButtonProps) {
  return (
    <button className={styles.cancelButton} onClick={onClick}>
      <img
        src={XIcon}
        alt="Cancelar"
        className={styles.icon}
      />
    </button>
  );
}

export default CancelButton;