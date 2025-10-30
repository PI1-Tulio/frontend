import React from 'react';
import styles from './AddButton.module.css';

import PlusIcon from '../../assets/icons/plus_icon.svg';

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <img
        src={PlusIcon}
        alt="Adicionar"
        className={styles.icon}
      />
    </button>
  );
}

export default AddButton;