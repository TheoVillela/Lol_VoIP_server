import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import riot from "./riotProcess.js";

const rooms = {};
const app = express();
const rotas = express.Router();

rotas.get("/getUserID", async (req, res) => {
  const { summonerName, tagLine } = req.query;

  console.log(summonerName + ": " + tagLine);
  const puuid = await riot.getPuuId(summonerName, tagLine);

  res.status(200).send({ puuid: puuid });
});

rotas.get("/check/", (req, res) => {
  res.status(200).send({ message: "Tudo OK!" });
});

rotas.get("/getActiveGame/", async (req, res) => {
  const { puuid } = req.query;
  const data = await riot.getActiveGame(puuid);

  res.status(200).send({ data });
});

app.use(rotas);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  socket.emit("connected");
  // Entrar em uma sala
  socket.on("joinRoom", (data) => {
    const gameId = data.gameID;
    console.log(gameId);
    socket.join(gameId);
    console.log(`Usuário ${socket.id} entrou na sala ${gameId}`);

    // Criar um array para armazenar os usuários da sala, se não existir ainda
    if (!rooms[gameId]) {
      rooms[gameId] = [];
    }

    // Enviar a lista de usuários já na sala para o novo cliente
    socket.emit("user-list", rooms[gameId]);

    // Avisar os outros usuários na sala que um novo cliente entrou
    socket.to(gameId).emit("user-joined", socket.id);

    // Adicionar o novo usuário à lista da sala
    rooms[gameId].push(socket.id);
  });

  // Troca de mensagens WebRTC
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // Sair da sala
  socket.on("disconnect", ({ gameId }) => {
    socket.leave(gameId);
    console.log(`Usuário ${socket.id} desconectou.`);
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
