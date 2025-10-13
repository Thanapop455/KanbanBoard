// src/hooks/useBoardData.js
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import useKanbanStore from "../store/kanbanStore";
import { getBoard, listMembers, createInvite } from "../api/board.jsx";
import { listColumns } from "../api/column.jsx";
import { listTasks } from "../api/task.jsx";
import { listTags } from "../api/tag.jsx";

export default function useBoardData(boardId) {
  const { token } = useKanbanStore();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState(null);
  const [members, setMembers] = useState([]);
  const [tags, setTags] = useState([]);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const [b, m, t] = await Promise.all([
        getBoard(token, boardId),
        listMembers(token, boardId),
        listTags(token, boardId),
      ]);
      setBoard(b.data.board);
      setMembers(m.data.members || []);
      setTags(t.data.tags || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "โหลดบอร์ดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [boardId, token]);

  const refreshColumnsTasks = useCallback(async () => {
    try {
      const [colRes, taskRes] = await Promise.all([
        listColumns(token, boardId),
        listTasks(token, boardId),
      ]);
      setBoard((prev) => {
        if (!prev) return prev;
        const columns = colRes.data.columns.map((c) => ({
          ...c,
          tasks: taskRes.data.tasks.filter((t) => t.columnId === c.id),
        }));
        return { ...prev, columns };
      });
    } catch (err) {
      toast.error("รีเฟรชข้อมูลไม่สำเร็จ");
    }
  }, [boardId, token]);

  const reloadTags = useCallback(async () => {
    const res = await listTags(token, boardId);
    setTags(res.data.tags || []);
  }, [boardId, token]);

  const createInviteLink = useCallback(async (email, role = "MEMBER") => {
    const res = await createInvite(token, boardId, { email, role });
    return res?.data?.invite?.token;
  }, [boardId, token]);

  return {
    loading, board, members, tags,
    setBoard, setMembers, setTags,
    loadBoard, refreshColumnsTasks, reloadTags, createInviteLink
  };
}
