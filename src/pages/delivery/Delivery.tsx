import { useEffect, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext/useContext";
import { useParams } from "react-router-dom";
import { getDeliveryById, resendDelivery } from "../../api/deliveryService";
import styles from "./Delivery.module.css";

interface Position {
  x: number;
  y: number;
  angle: number;
}

export function Delivery() {
  const { id } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { delivery, setDelivery } = useSocketContext() || { delivery: null };

  useEffect(() => {
    if (!id || !setDelivery) {
      return;
    }

    getDeliveryById(Number(id)).then((deliveryData) => {
      setDelivery(deliveryData || null);
    });
  }, [id, setDelivery]);

  useEffect(() => {
    if (!delivery || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const directions = [
      [0, -1],  // cima
      [1, 0],   // direita
      [0, 1],   // baixo
      [-1, 0],  // esquerda
    ]

    const borders = delivery.instructions.reduce((acc, curr) => {
      if (curr.action === "MOVE") {
        const [dx, dy] = directions[acc.currentDirection];
        acc.currentX += dx * curr.value;
        acc.currentY += dy * curr.value;
        acc.minX = Math.min(acc.minX, acc.currentX);
        acc.maxX = Math.max(acc.maxX, acc.currentX);
        acc.minY = Math.min(acc.minY, acc.currentY);
        acc.maxY = Math.max(acc.maxY, acc.currentY);
      } else if (curr.action === "TURN") {
        acc.currentDirection = (acc.currentDirection + (curr.value === 1 ? 1 : 3)) % 4;
      }
      return acc;
    }, {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      currentX: 0,
      currentY: 0,
      currentDirection: 0 // 0: cima, 1: direita, 2: baixo, 3: esquerda
    });

    const maxDistanceFromCenter = Math.max(1, Math.abs(borders.maxX), Math.abs(borders.minX), Math.abs(borders.maxY), Math.abs(borders.minY));
    // Configurações do canvas
    const width = canvas.width;
    const height = canvas.height;
    const scale = (Math.min(width, height) - 50) / (maxDistanceFromCenter * 2);
    const startX = width / 2;
    const startY = height / 2;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Desenhar grid
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += scale) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += scale) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    const positions: Position[] = [{ x: startX, y: startY, angle: -Math.PI / 2 }]; // Começa apontando para cima

    delivery.instructions.forEach((instruction) => {
      const lastPos = positions[positions.length - 1];

      if (instruction.action === "MOVE") {
        const distance = instruction.value * scale;
        const newX = lastPos.x + Math.cos(lastPos.angle) * distance;
        const newY = lastPos.y + Math.sin(lastPos.angle) * distance;
        positions.push({ x: newX, y: newY, angle: lastPos.angle });
      } else if (instruction.action === "TURN") {
        const turnAngle = instruction.value === 1 ? Math.PI / 2 : -Math.PI / 2; // 1 = direita (90°), 0 = esquerda (-90°)
        positions.push({
          x: lastPos.x,
          y: lastPos.y,
          angle: lastPos.angle + turnAngle
        });
      }
    });

    // Desenhar o percurso planejado (cinza claro)
    ctx.strokeStyle = "rgba(102, 126, 234, 0.3)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(positions[0].x, positions[0].y);
    positions.forEach((pos) => {
      ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();

    // Desenhar o percurso executado (verde)
    const executedInstructions = delivery.instructions.filter(
      (inst) => inst.action === "TURN" ? inst.endTime !== null : inst.actuallyExecuted > 0
    );

    if (executedInstructions.length > 0) {
      const executedPositions: Position[] = [{ x: startX, y: startY, angle: -Math.PI / 2 }];

      executedInstructions.forEach((instruction) => {
        const lastPos = executedPositions[executedPositions.length - 1];

        if (instruction.action === "MOVE") {
          const distance = instruction.actuallyExecuted * scale;
          const newX = lastPos.x + Math.cos(lastPos.angle) * distance;
          const newY = lastPos.y + Math.sin(lastPos.angle) * distance;
          executedPositions.push({ x: newX, y: newY, angle: lastPos.angle });
        } else if (instruction.action === "TURN") {
          const turnAngle = instruction.value === 1 ? Math.PI / 2 : -Math.PI / 2;
          executedPositions.push({
            x: lastPos.x,
            y: lastPos.y,
            angle: lastPos.angle + turnAngle
          });
        }
      });

      ctx.strokeStyle = "rgba(76, 175, 80, 0.8)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(executedPositions[0].x, executedPositions[0].y);
      executedPositions.forEach((pos) => {
        ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();

      // Desenhar o carrinho na posição atual
      const currentPos = executedPositions[executedPositions.length - 1];
      const carWidth = 20;
      const carHeight = 30;

      ctx.save();
      ctx.translate(currentPos.x, currentPos.y);
      ctx.rotate(currentPos.angle + Math.PI / 2);

      // Corpo do carrinho
      ctx.fillStyle = "#ff5722";
      ctx.fillRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);

      // Frente do carrinho (mais escura)
      ctx.fillStyle = "#d84315";
      ctx.fillRect(-carWidth / 2, -carHeight / 2, carWidth, 8);

      // Rodas
      ctx.fillStyle = "#333";
      ctx.fillRect(-carWidth / 2 - 3, -carHeight / 2 + 5, 3, 8);
      ctx.fillRect(carWidth / 2, -carHeight / 2 + 5, 3, 8);
      ctx.fillRect(-carWidth / 2 - 3, carHeight / 2 - 13, 3, 8);
      ctx.fillRect(carWidth / 2, carHeight / 2 - 13, 3, 8);

      ctx.restore();
    }

    // Desenhar ponto de início
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar ponto de fim (planejado)
    const finalPos = positions[positions.length - 1];
    ctx.fillStyle = "#f44336";
    ctx.beginPath();
    ctx.arc(finalPos.x, finalPos.y, 8, 0, Math.PI * 2);
    ctx.fill();

  }, [delivery]);

  if (!delivery) {
    return <div className={styles.loading}>Carregando entrega...</div>;
  }

  const totalInstructions = delivery.instructions.length;
  const executedInstructions = delivery.instructions.filter(
    (inst) => inst.endTime !== null
  ).length;
  const progress = totalInstructions > 0
    ? Math.round((executedInstructions / totalInstructions) * 100)
    : 0;

  return (
    <div className={styles.container}>

      <div className={styles.mainContent}>
        <div className={styles.visualizationSection}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className={styles.canvas}
          />

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.pathColor}`}></div>
              <span>Percurso Planejado</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.executedColor}`}></div>
              <span>Percurso Executado</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.carColor}`}></div>
              <span>Carrinho</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ background: '#4caf50' }}></div>
              <span>Início</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ background: '#f44336' }}></div>
              <span>Destino</span>
            </div>
          </div>

          <button onClick={() => { if (id) resendDelivery(Number(id)) }}>Resend:</button>
        </div>

        <div>
          <div className={styles.deliveryInfo}>
            <h2>Entrega: {delivery.name}</h2>
            <p><strong>Progresso:</strong> {executedInstructions}/{totalInstructions} instruções ({progress}%)</p>
            <p><strong>Potências:</strong> L: {delivery.potL} | R: {delivery.potR}</p>
          </div>
          <div className={styles.instructionsSection}>
            <h3>📋 Lista de Instruções</h3>
            <ul className={styles.instructionsList}>
              {delivery.instructions.map((instruction, index) => {
                const isCompleted = instruction.endTime !== null;
                const isExecuting = instruction.startTime !== null && !isCompleted;
                const isPending = !instruction.startTime;

                let statusClass = styles.pending;
                if (isCompleted) statusClass = styles.completed;
                else if (isExecuting) statusClass = styles.executing;

                return (
                  <li
                    key={instruction.id}
                    className={`${styles.instructionItem} ${statusClass}`}
                  >
                    <div className={styles.instructionHeader}>
                      <span className={styles.instructionNumber}>#{index + 1}</span>
                      <span className={styles.instructionAction}>
                        {instruction.action === "MOVE" ? (
                          <>
                            <span className={styles.moveIcon}>↑</span>
                            Mover
                          </>
                        ) : (
                          <>
                            <span className={styles.turnIcon}>
                              {instruction.value === 1 ? "↻" : "↺"}
                            </span>
                            Virar {instruction.value === 1 ? "Direita" : "Esquerda"}
                          </>
                        )}
                      </span>
                    </div>

                    <div className={styles.instructionDetails}>
                      {instruction.action === "MOVE" ? (
                        <>
                          Planejado: {instruction.value} unidades
                          {isCompleted && instruction.actuallyExecuted !== instruction.value && (
                            <> | Executado: {instruction.actuallyExecuted} unidades</>
                          )}
                        </>
                      ) : (
                        <>{instruction.value === 1 ? "90° horário" : "90° anti-horário"}</>
                      )}
                    </div>

                    <div className={styles.instructionStatus}>
                      {isCompleted && "✓ Concluída"}
                      {isExecuting && "⏳ Executando..."}
                      {isPending && "⏸ Pendente"}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}