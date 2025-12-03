import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

let tempo = 0;

// Reinicia o tempo toda vez que o servidor é iniciado
tempo = 0;

// A cada segundo, o tempo "real" aumenta
setInterval(() => {
    tempo += 1;
}, 1000);

// Rota que devolve o tempo atual
app.get("/api/tempo", (req, res) => {
    res.json({ tempo: tempo.toFixed(0) });
});

app.listen(port, () => {
    console.log(` 🟢 Mock server rodando em http://localhost:${port}`);
});