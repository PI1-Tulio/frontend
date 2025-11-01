import styles from './Instrucao.module.css';
import Header from '../../components/Header/Header';
import AddButton from '../../components/Button/AddButton';
import CancelButton from '../../components/CancelButton/CancelButton';
import ConfirmButton from '../../components/ConfirmButton/ConfirmButton';
import { InstructionCard } from '../../components/InstructionCard/InstructionCard';
import { useState, useTransition } from 'react';
import { api } from '../../api/client';

type Instruction = {
  id: number;
  action: 'move' | 'turn';
  value: number;
};

export function Instrucao() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, startTransition] = useTransition();

  const handleAddClick = () => {
    const newInstruction: Instruction = {
      id: instructions.length + 1,
      action: 'move',
      value: 0
    };
    setInstructions(currentInstructions => [
      ...currentInstructions,
      newInstruction
    ]);
  };

  const handleCancelClick = () => {
    setInstructions([]);
  };

  const handleConfirmClick = () => {
    startTransition(async () => {
      console.log("starting");
      await api.post("/instructions", instructions);
      console.log("ending");
    })
  };

  const handleDeleteCard = (idToDelete: number) => {
    setInstructions(currentInstructions =>
      currentInstructions.filter(inst => inst.id !== idToDelete)
    );
  };


  return (
    <>
      <Header />
      <div className={styles.instrucaoContainer}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Insira as Instruções</h1>
          {instructions.length === 0 ? (
            <p className={styles.subtitle}>As instruções aparecem aqui!</p>
          ) : (
            <div className={styles.cardListWrapper}>
              {instructions.map((inst, index) => (
                <InstructionCard
                  key={inst.id}
                  id={inst.id}
                  instructionNumber={index + 1}
                  action={inst.action}
                  value={inst.value}
                  onDelete={handleDeleteCard}
                  onUpdate={(id, action, value) => {
                    setInstructions(currentInstructions =>
                      currentInstructions.map(instruction =>
                        instruction.id === id
                          ? { ...instruction, action, value }
                          : instruction
                      )
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className={styles.buttonWrapper}>
          <CancelButton onClick={handleCancelClick} disabled={isLoading} />
          <AddButton onClick={handleAddClick} disabled={isLoading} />
          <ConfirmButton onClick={handleConfirmClick} disabled={isLoading} />
        </div>
      </div>
    </>
  );
}

export default Instrucao;