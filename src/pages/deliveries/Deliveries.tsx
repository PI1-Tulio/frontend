import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDeliveries } from "../../api/deliveryService";
import type { Delivery } from "../../api/DeliveryDTO";
import styles from "./Deliveries.module.css";

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    try {
      setLoading(true);
      setError(null);
      const data = await listDeliveries();
      setDeliveries(data);
    } catch (err) {
      setError("Erro ao carregar as entregas. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleDeliveryClick(deliveryId: number) {
    navigate(`/delivery/${deliveryId}`);
  }

  function getDeliveryStatus(delivery: Delivery) {
    const hasStarted = delivery.startTime !== null;
    const hasEnded = delivery.endTime !== null;

    if (hasEnded) return "completed";
    if (hasStarted) return "inProgress";
    return "pending";
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "completed":
        return "Concluída";
      case "inProgress":
        return "Em Andamento";
      case "pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  }

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "Não iniciada";

    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>⏳ Carregando entregas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          ❌ {error}
          <br />
          <button
            onClick={loadDeliveries}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (deliveries?.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>📦 Nenhuma entrega encontrada</h2>
          <p>Crie uma nova entrega para começar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Minhas Entregas</h1>
        <p>Gerencie e acompanhe todas as suas entregas</p>
      </div>

      <div className={styles.deliveriesGrid}>
        {deliveries.map((delivery) => {
          const status = getDeliveryStatus(delivery);

          return (
            <div
              key={delivery.id}
              className={styles.deliveryCard}
              onClick={() => handleDeliveryClick(delivery.id)}
            >
              <div className={styles.deliveryHeader}>
                <div className={styles.deliveryTitle}>
                  <h3>{delivery.name}</h3>
                  <span className={styles.deliveryId}>ID: #{delivery.id}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[status]}`}>
                  {getStatusLabel(status)}
                </span>
              </div>

              <div className={styles.deliveryInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>🔋 Potências:</span>
                  <div className={styles.potValues}>
                    <div className={styles.potItem}>
                      <span className={styles.potLabel}>L:</span>
                      <span className={styles.potValue}>{delivery.potL}</span>
                    </div>
                    <div className={styles.potItem}>
                      <span className={styles.potLabel}>R:</span>
                      <span className={styles.potValue}>{delivery.potR}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.deliveryFooter}>
                <span className={styles.timestamp}>
                  {formatDate(delivery.startTime)}
                </span>
                <button className={styles.viewButton}>
                  Ver Detalhes →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}