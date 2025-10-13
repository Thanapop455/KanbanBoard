import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useKanbanStore from "../../store/kanbanStore";
import { createBoard } from "../../api/board";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

const BoardCreate = () => {
  const navigate = useNavigate();
  const { token } = useKanbanStore();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await createBoard(token, { name: name.trim() });
      toast.success("สร้างบอร์ดสำเร็จ");
      navigate(`/app/board/${res.data.board.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "สร้างบอร์ดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">New Board</h1>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg 
             bg-[var(--primary)] text-white px-3 py-2 text-sm
             transition-all duration-200 ease-out
             hover:bg-[var(--primary-hover)] hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]
             active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <PlusCircle size={16} />
          Create
        </button>
      </form>
    </div>
  );
};

export default BoardCreate;
