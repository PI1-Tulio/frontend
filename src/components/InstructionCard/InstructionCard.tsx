import React, {useState} from 'react';
import styles from './InstructionCard.module.css';
import TrashIcon from '../../assets/icons/trash-icon.svg';

interface InstructionCardProps {
  id: number; 
  instructionNumber: number;
  onDelete: (id: number) => void;
}

type ActionType = 'select' | 'follow' | 'left' | 'right';

const ACTION_TEXT: Record<ActionType, string> = {
  select: "Escolha uma ação",
  follow: "Seguir em frente",
  left: "Virar à esquerda",
  right: "Virar à direita",
};

export function InstructionCard({ id, instructionNumber, onDelete }: InstructionCardProps) {

  const [selectedAction, setSelectedAction] = useState<ActionType>('select');
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(event.target.value as ActionType);
   };

  const handleDeleteClick = () => {
    onDelete(id);
  };

  return (
    <div className={styles.cardContainer}>
      
      <select 
        className={styles.dropdown}
        value={selectedAction}      
        onChange={handleDropdownChange}
      >
        <option value="select">Ação</option>
        <option value="follow">↑ Seguir em frente</option>
        <option value="left">← Virar à esquerda</option>
        <option value="right">→ Virar à direita</option>
      </select>

      <h3 className={styles.title}>Instrução {instructionNumber}</h3>

    {selectedAction === 'follow' ? (
        <>
          <p className={styles.actionTextFollow}>
            {ACTION_TEXT.follow}
          </p>
          <input 
            type="number" 
            placeholder="cm" 
            className={styles.cmInput} 
          />
        </>
      ) : (
        <>
          <p className={styles.actionTextDefault}>
            {ACTION_TEXT[selectedAction]}
          </p>
        </>
      )}

      <img 
        src={TrashIcon} 
        alt="Excluir"
        className={styles.trashIcon} 
        onClick={handleDeleteClick} />
    </div>
  );
}

export default InstructionCard;