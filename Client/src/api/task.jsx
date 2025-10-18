import axios from "axios";
// const API = "http://localhost:5001/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// List tasks (with filter)
export const listTasks = async (token, boardId, params = {}) =>
  await axios.get(`${API}/boards/${boardId}/tasks`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

// Create new task
export const createTask = async (token, columnId, data) =>
  await axios.post(`${API}/columns/${columnId}/tasks`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Update task
export const updateTask = async (token, id, data) =>
  await axios.put(`${API}/tasks/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Delete task
export const deleteTask = async (token, id) =>
  await axios.delete(`${API}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Move task to another column
export const moveTask = async (token, id, data) =>
  await axios.patch(`${API}/tasks/${id}/move`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Reorder tasks inside a column
export const reorderTasksInColumn = async (token, columnId, order) =>
  await axios.patch(`${API}/columns/${columnId}/tasks/reorder`, { order }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Assign / Unassign users

export const listAssignees = (token, taskId) =>
  axios.get(`${API}/tasks/${taskId}/assignees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
export const assignUser = async (token, taskId, userId) =>
  await axios.post(`${API}/tasks/${taskId}/assignees`, { userId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const unassignUser = async (token, taskId, userId) =>
  await axios.delete(`${API}/tasks/${taskId}/assignees/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
