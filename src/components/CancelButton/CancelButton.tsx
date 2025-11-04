import React from 'react';
import styles from './CancelButton.module.css';

import XIcon from '../../assets/icons/x-icon.svg';

type CancelButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function CancelButton(attributes: CancelButtonProps) {
  return (
    <button className={styles.cancelButton} {...attributes}>
      <img
        src={XIcon}
        alt="Cancelar"
        className={styles.icon}
      />
    </button>
  );
}

export default CancelButton;