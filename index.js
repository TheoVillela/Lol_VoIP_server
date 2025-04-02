const chatControl = require("./riotProcess");
const express = require("express");
const { createServer } = require("http");
const socketIo = require("socket.io");

const app = express();
const server = createServer(app);
const io = socketIo(server);

io.on("connection", async (socket) => {
  console.log("Novo usuário conectado:", socket.id);

  const result = await verificaUsuarioPartida(socket);

  if (!result) {
    socket.emit("connectionFailed", {
      code: "007",
      data: "Não possui partida em andamento",
    });
    socket.disconnect();
  }

  //  Usuário saindo da sala
  socket.on("leaveRoom", (gameId) => {
    socket.leave(gameId);
    socket.to(gameId).emit("user-left", socket.id);
  });

  socket.on("audio1", (data) => {
    const { game_id, data_audio } = data;
    socket.to(game_id).emit("audio1", data_audio);
  });

  //  Desconectar usuário
  socket.on("disconnect", (gameId) => {
    console.log(`Usuário desconectado: ${socket.id}`);
    socket.to(gameId).emit("user-left", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor Socket.IO rodando na porta 3000");
});

async function verificaUsuarioPartida(socket) {
  let { summonerName, tagLine } = socket.handshake.auth;
  console.log(`Name: ${summonerName}, tag ${tagLine}`);

  // Obtém PuuId e informações da partida
  let PuuId = await chatControl.getPuuId(summonerName, tagLine);
  let match = await chatControl.getActiveGame(PuuId);

  if (!match) {
    return false;
  }
  // Define o gameid+teamid
  let gameId = match.gameId + match.teamId;

  // **Adiciona o cliente na sala**
  socket.join(gameId);
  console.log(`Usuário ${socket.id} entrou na sala ${gameId}`);

  // Avisar os outros clientes na sala que um novo usuário entrou
  socket.to(gameId).emit("new-user", socket.id);

  socket.emit("game-id", { gameId });

  return true;
}
