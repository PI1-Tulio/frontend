import React, { useEffect, useState } from "react";

const TempoOperacao: React.FC = () => {
    const [tempo, setTempo] = useState<number>(0);

    // Atualiza o tempo pegando do backend
    useEffect(() => {
        let ativo = true;

        const atualizarTempo = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/tempo");
                if (!response.ok) throw new Error("Falha ao buscar tempo");
                const data = await response.json();
                if (ativo) setTempo(parseFloat(data.tempo));
            } catch (error) {
                console.error("Erro ao buscar tempo:", error);
            }
        };

        // Atualiza imediatamente ao carregar
        atualizarTempo();

        // Atualiza a cada 1 segundo, de forma precisa
        const interval = setInterval(atualizarTempo, 1000);

        return () => {
            ativo = false;
            clearInterval(interval);
        };
    }, []);



    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                left: "20px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // centraliza título e caixa entre si
            }}
        >
            <div
                style={{
                    backgroundColor: "transparent",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    marginBottom: "6px",
                }}
            >
                Tempo Percorrido:
            </div>
            <div
                style={{
                    backgroundColor: "#f0f0f0",
                    color: "#000",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    minWidth: "180px",
                    textAlign: "center",
                }}
            >
                {tempo.toFixed(2)}s
            </div>
        </div>
    );
};

export default TempoOperacao;
