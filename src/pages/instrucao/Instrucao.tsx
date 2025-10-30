import styles from './Instrucao.module.css';
import Header from '../../components/Header/Header'; 
import AddButton from '../../components/Button/AddButton';
import CancelButton from '../../components/CancelButton/CancelButton';
import ConfirmButton from '../../components/ConfirmButton/ConfirmButton';
import InstructionCard from '../../components/InstructionCard/InstructionCard';
import React, { useState, useRef } from 'react'; 
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type Instruction = {
  id: number;
};

export function Instrucao() {
  
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const nextId = useRef(1);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleAddClick = () => {
    const newInstruction: Instruction = {
      id: nextId.current,
    };
    nextId.current += 1;
    setInstructions(currentInstructions => [
      ...currentInstructions, 
      newInstruction
    ]);
  };

  const handleCancelClick = () => {
    setInstructions([]); 
    nextId.current = 1;
  };

  const handleConfirmClick = () => {
    alert("Botão CONFIRMAR clicado!");
  };

  const handleDeleteCard = (idToDelete: number) => {
    setInstructions(currentInstructions => 
      currentInstructions.filter(inst => inst.id !== idToDelete)
    );
  };

 const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setInstructions((currentInstructions) => {
      const oldIndex = currentInstructions.findIndex(inst => inst.id === active.id);
      const newIndex = currentInstructions.findIndex(inst => inst.id === over.id);

      return arrayMove(currentInstructions, oldIndex, newIndex);
    });
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                // Passamos um array *apenas dos IDs*
                items={instructions.map(inst => inst.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.cardListWrapper}>
                  {instructions.map((inst, index) => (
                    <InstructionCard 
                      key={inst.id} 
                      id={inst.id}
                      instructionNumber={index + 1} 
                      onDelete={handleDeleteCard}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          
          )}

        </div>
        <div className={styles.buttonWrapper}>
          <CancelButton onClick={handleCancelClick} />
          <AddButton onClick={handleAddClick} />
          <ConfirmButton onClick={handleConfirmClick} />
        </div>

      </div>
    </> 
  );
}

export default Instrucao;