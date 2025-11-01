import React from 'react';
import styles from './InstructionCard.module.css';
import TrashIcon from '../../assets/icons/trash-icon.svg';

interface InstructionCardProps {
  id: number;
  instructionNumber: number;
  action: 'move' | 'turn';
  value: number;
  onDelete: (id: number) => void;
  onUpdate: (id: number, action: 'move' | 'turn', value: number) => void;
}

export function InstructionCard({ id, instructionNumber, action, value, onDelete, onUpdate }: InstructionCardProps) {

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAction = event.target.value as 'move' | 'turn';
    onUpdate(id, newAction, newAction === 'move' ? value : 0);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value ? parseInt(event.target.value.replaceAll(/\D/g, "")) : 0;

    if (!isNaN(newValue)) {
      if (action === 'move') {
        onUpdate(id, action, newValue);
      } else {
        onUpdate(id, action, newValue > 0 ? 1 : 0);
      }
    }
  };

  const handleDeleteClick = () => {
    onDelete(id);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.instructionSelectors}>
        <select
          className={styles.dropdown}
          value={action}
          onChange={handleActionChange}
        >
          <option value="move">↑ Mover</option>
          <option value="turn">↺ Girar</option>
        </select>

        <div>
          <h3 className={styles.title}>Instrução {instructionNumber}</h3>
          {action === 'move' ? (
            <>
              <div className={styles.valueInputContainer}>
                <input
                  type="text"
                  className={styles.valueInput}
                  value={value}
                  onChange={handleValueChange}
                />
                <span>passos</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.valueInputContainer}>
                <select
                  className={styles.directionSelect}
                  value={value}
                  onChange={(e) => onUpdate(id, action, parseInt(e.target.value))}
                >
                  <option value={0}>Esquerda</option>
                  <option value={1}>Direita</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        className={styles.trashButton}
        onClick={handleDeleteClick}
      >
        <img src={TrashIcon} alt="Excluir instrução" />
      </button>
    </div>
  );
}
