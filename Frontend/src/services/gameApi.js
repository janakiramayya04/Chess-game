import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const createGame = async () => {
  const res = await axios.post(`${API}/game/create`);
  return res.data.game_id;
};

export const getBoard = async (gameId) => {
  const res = await axios.get(`${API}/game/${gameId}`);
  return res.data.fen;
};

export const makeMove = async (gameId, move) => {
     console.log("API call:", gameId, move);
  const res = await axios.post(`${API}/game/${gameId}/move/${move}`);
  return res.data;
};
