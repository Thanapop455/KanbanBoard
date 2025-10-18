import axios from "axios";
const API = "http://localhost:5001/api";

// List tags in board
export const listTags = async (token, boardId) =>
  await axios.get(`${API}/boards/${boardId}/tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Create tag
export const createTag = async (token, boardId, data) =>
  await axios.post(`${API}/boards/${boardId}/tags`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Update tag
export const updateTag = async (token, id, data) =>
  await axios.put(`${API}/tags/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Delete tag
export const deleteTag = async (token, id) =>
  await axios.delete(`${API}/tags/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Attach tag to task
export const attachTag = async (token, taskId, tagId) =>
  await axios.post(`${API}/tasks/${taskId}/tags`, { tagId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Detach tag from task
export const detachTag = async (token, taskId, tagId) =>
  await axios.delete(`${API}/tasks/${taskId}/tags/${tagId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
