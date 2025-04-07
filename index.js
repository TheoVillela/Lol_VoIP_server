import express from "express";
import { createServer } from "http";
import riot from "./riotProcess.js";
import cors from "cors";

const rooms = {};
const app = express();
const rotas = express.Router();

let usersLogged = [];
app.use(express.json());

app.use(
  cors({
    origin: "https://voip-da-galera.vercel.app", // ou '*' http://localhost:5173[, "*"]
  })
);

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

rotas.post("/connectUser/", async (req, res) => {
  const { puuid } = req.body;
  console.log(`Puuid recebido: ${puuid}`);

  const userConnected = CheckUserLogged(puuid);

  console.log(`Puuid encontrado? : ${userConnected}`);

  if (userConnected) {
    res.status(304).send({ message: "Usuario ja Conectado" });
  } else {
    ConnectUser(puuid);
    res.status(200).send({ message: "Usuario connectado com sucesso" });
  }
});

rotas.post("/disconnectUser/", async (req, res) => {
  const { puuid } = req.body;

  console.log(`Puuid recebido: ${puuid}`);
  DisconnectUser(puuid);

  res.status(200).send({ data: "Usuario disconnectado!" });
});

function ConnectUser(puuid) {
  usersLogged.push(puuid);
}

function DisconnectUser(puuid) {
  usersLogged = usersLogged.filter((userId) => userId != puuid);
}

function CheckUserLogged(puuid) {
  return usersLogged.includes(puuid);
}

app.use(rotas);

const server = createServer(app);

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
