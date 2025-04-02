const axios = require("axios");
const RIOT_API_KEY = "RGAPI-15b8c57f-899f-4680-b1ac-dd6c2b65a013";
const RIOT_REGION = "br1";

async function getPuuId(summonerName, tagLine) {
  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagLine}/`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );
    return response.data.puuid; // Retorna o summonerId
  } catch (error) {
    console.error("Erro ao obter summonerId:", error);
    return null;
  }
}

// Função para obter o game ativo do usuario PuuID
async function getActiveGame(puuid) {
  try {
    const response = await axios.get(
      `https://${RIOT_REGION}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    const data = response.data;
    console.log("Partida encontrada após request para RIOT.");
    // Filtra o participante com base no puuid
    const participant = data.participants.find((p) => p.puuid === puuid);

    if (!participant) {
      console.log("Participante não encontrado na partida ativa.");
      return null;
    }

    console.log("Participante encontrado");

    // Retorna gameId e teamId
    const result = {
      gameId: String(data.gameId),
      teamId: String(participant.teamId),
    };
    return result;
  } catch (error) {
    // Verifica se o erro é de "não encontrado" (404)
    if (error.response && error.response.status === 404) {
      console.log("Nenhuma partida ativa encontrada para o invocador.");
      return false; // Retorna null quando não encontrar uma partida ativa
    }

    // Outros erros são lançados normalmente
    console.error("Erro ao obter a partida ativa:", error);
    return false;
  }
}

module.exports = { getPuuId, getActiveGame };
