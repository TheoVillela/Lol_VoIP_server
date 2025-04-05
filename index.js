import express from "express";
import { createServer } from "http";
import riot from "./riotProcess.js";
import cors from "cors";

const rooms = {};
const app = express();
const rotas = express.Router();

app.use(
  cors({
    origin: "https://voip-da-galera.vercel.app/", // ou '*' http://localhost:5173
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

app.use(rotas);

const server = createServer(app);

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
