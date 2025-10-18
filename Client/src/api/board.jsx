import axios from "axios";
// const API = "http://localhost:5001/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ========== Board ==========
export const listBoards = async (token) =>
  await axios.get(`${API}/boards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoard = async (token, data) =>
  await axios.post(`${API}/boards`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getBoard = async (token, id) =>
  await axios.get(`${API}/boards/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const renameBoard = async (token, id, data) =>
  await axios.put(`${API}/boards/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteBoard = async (token, id) =>
  await axios.delete(`${API}/boards/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ========== Members ==========
export const listMembers = async (token, boardId) =>
  await axios.get(`${API}/boards/${boardId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMemberRole = async (token, boardId, userId, role) =>
  await axios.patch(
    `${API}/boards/${boardId}/members/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const removeMember = async (token, boardId, userId) =>
  await axios.delete(`${API}/boards/${boardId}/members/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const transferOwnership = async (token, boardId, userId) =>
  await axios.post(`${API}/boards/${boardId}/transfer-ownership`, { userId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const leaveBoard = async (token, boardId) =>
  await axios.post(`${API}/boards/${boardId}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createInvite = async (token, boardId, data) =>
  await axios.post(`${API}/boards/${boardId}/invite`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const acceptInvite = async (token, inviteToken) =>
  await axios.post(`${API}/invites/${inviteToken}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
