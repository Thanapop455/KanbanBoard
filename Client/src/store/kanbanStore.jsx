import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listBoards } from "../api/board";
import { listColumns } from "../api/column";
import { listTasks } from "../api/task";

const kanbanStore = (set, get) => ({
  user: null,
  token: null,
  boards: [],
  columns: [],
  tasks: [],

  logout: () => {
    set({ user: null, token: null, boards: [], columns: [], tasks: [] });
    localStorage.removeItem("kanbanStore");
  },

  actionLogin: async (form) => {
    const res = await axios.post("https://kanbanboard-nsud.onrender.com/api/login", form);
    set({ user: res.data.payload, token: res.data.token });
    return res;
  },

  getBoards: async () => {
    const token = get().token;
    if (!token) return;
    const res = await listBoards(token);
    set({ boards: res.data.boards });
  },

  getColumns: async (boardId) => {
    const token = get().token;
    const res = await listColumns(token, boardId);
    set({ columns: res.data.columns });
  },

  getTasks: async (boardId) => {
    const token = get().token;
    const res = await listTasks(token, boardId);
    set({ tasks: res.data.tasks });
  },
});

const usePersist = {
    name: 'kanbanStore',
    storage: createJSONStorage(()=>localStorage)
}
const useKanbanStore = create( persist(kanbanStore,usePersist))

export default useKanbanStore;
