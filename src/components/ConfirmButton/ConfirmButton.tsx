import React from 'react';
import styles from './ConfirmButton.module.css';

import XIcon from '../../assets/icons/check-icon.svg';

type ConfirmButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function ConfirmButton(attributes: ConfirmButtonProps) {
  return (
    <button className={styles.confirmButton} {...attributes}>
      <img
        src={XIcon}
        alt="Confirmar"
        className={styles.icon}
      />
    </button>
  );
}

export default ConfirmButton;