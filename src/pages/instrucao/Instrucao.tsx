import styles from './Instrucao.module.css';
import AddButton from '../../components/Button/AddButton';
import CancelButton from '../../components/CancelButton/CancelButton';
import ConfirmButton from '../../components/ConfirmButton/ConfirmButton';
import { InstructionCard } from '../../components/InstructionCard/InstructionCard';
import { useEffect, useRef, useState, useTransition } from 'react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createDelivery } from '../../api/deliveryService';
import type { CreateInstructionDTO } from '../../api/DeliveryDTO';
import { useNavigate } from 'react-router-dom';

type InstructionCard = CreateInstructionDTO & { id: number };

export function Instrucao() {
  const [instructions, setInstructions] = useState<InstructionCard[]>([]);
  const [potencia, setPotencia] = useState<number>(200);
  const [isLoading, startTransition] = useTransition();
  const [name, setName] = useState<string>('Entrega 1');

  const navigate = useNavigate();

  const buttonsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    buttonsRef.current?.scrollIntoView({ behavior: "instant" });
  }, [instructions]);

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
    const newInstruction: InstructionCard = {
      id: instructions.length + 1,
      action: 'MOVE',
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
      try {
        const payload = { potL: potencia, potR: potencia, instructions, name };
        console.log("Creating delivery with payload:", payload);
        const { id } = await createDelivery(payload);
        navigate(`/delivery/${id}`);
      } catch (error) {
        console.error("Error creating delivery:", error);
      }
    });
  };

  const handleDeleteCard = (idToDelete: number) => {
    setInstructions(currentInstructions =>
      currentInstructions.filter(inst => inst.id !== idToDelete)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
      <div className={styles.instrucaoContainer}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Insira as Instruções</h1>
          <div>
            <div>
              <label>Nome da Entrega: </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>Potência Da Roda: </label>
              <input
                type="number"
                min="0"
                max="100"
                value={potencia}
                onChange={(e) => setPotencia(Number(e.target.value))}
              />
            </div>
          </div>
          {instructions.length === 0 ? (
            <p className={styles.subtitle}>As instruções aparecem aqui!</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={instructions.map(inst => inst.id)}
                strategy={verticalListSortingStrategy}
              >
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
                        setInstructions(currentInstructions => {
                          const instruction = currentInstructions.find((instruction) => instruction.id === id);
                          if (!instruction) return currentInstructions;

                          instruction.action = action;
                          instruction.value = value;
                          return [...currentInstructions];
                        })
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div className={styles.buttonWrapper} ref={buttonsRef}>
          <CancelButton onClick={handleCancelClick} disabled={isLoading} />
          <AddButton onClick={handleAddClick} disabled={isLoading} />
          <ConfirmButton onClick={handleConfirmClick} disabled={isLoading} />
        </div>
      </div>
    </>
  );
}

export default Instrucao;