import axios from "axios";
// const API = "http://localhost:5001/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const listColumns = async (token, boardId) =>
  await axios.get(`${API}/boards/${boardId}/columns`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createColumn = async (token, boardId, data) =>
  await axios.post(`${API}/boards/${boardId}/columns`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const renameColumn = async (token, id, data) =>
  await axios.put(`${API}/columns/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteColumn = async (token, id) =>
  await axios.delete(`${API}/columns/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const reorderColumns = async (token, boardId, order) =>
  await axios.patch(`${API}/boards/${boardId}/columns/reorder`, { order }, {
    headers: { Authorization: `Bearer ${token}` },
  });
