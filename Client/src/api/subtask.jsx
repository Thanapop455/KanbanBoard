import axios from "axios";
// const API = "http://localhost:5001/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const listSubtasks = async (token, taskId) =>
  await axios.get(`${API}/tasks/${taskId}/subtasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createSubtask = async (token, taskId, data) =>
  await axios.post(`${API}/tasks/${taskId}/subtasks`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateSubtask = async (token, id, data) =>
  await axios.put(`${API}/subtasks/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteSubtask = async (token, id) =>
  await axios.delete(`${API}/subtasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const reorderSubtasks = async (token, taskId, order) =>
  await axios.patch(`${API}/tasks/${taskId}/subtasks/reorder`, { order }, {
    headers: { Authorization: `Bearer ${token}` },
  });
