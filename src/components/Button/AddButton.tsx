import React from 'react';
import styles from './AddButton.module.css';

import PlusIcon from '../../assets/icons/plus_icon.svg';

type AddButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function AddButton(attributes: AddButtonProps) {
  return (
    <button className={styles.addButton} {...attributes}>
      <img
        src={PlusIcon}
        alt="Adicionar"
        className={styles.icon}
      />
    </button>
  );
}

export default AddButton;