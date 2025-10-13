import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, ArrowRight } from "lucide-react";
import useKanbanStore from "../../store/kanbanStore";
import { toast } from "react-toastify";
import { createBoard, renameBoard, deleteBoard } from "../../api/board";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../../ui/swal-theme.css";

const BoardList = () => {
  const navigate = useNavigate();
  const { token, boards, getBoards } = useKanbanStore();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  useEffect(() => {
    getBoards().catch(() => toast.error("โหลดบอร์ดไม่สำเร็จ"));
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      await createBoard(token, { name: newName.trim() });
      setNewName("");
      await getBoards();
      toast.success("สร้างบอร์ดสำเร็จ");
    } catch (err) {
      toast.error(err?.response?.data?.message || "สร้างบอร์ดไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  };

  const onRename = async (id) => {
    if (!renameVal.trim()) return;
    try {
      await renameBoard(token, id, { name: renameVal.trim() });
      setRenamingId(null);
      await getBoards();
      toast.success("เปลี่ยนชื่อบอร์ดแล้ว");
    } catch (err) {
      toast.error(err?.response?.data?.message || "เปลี่ยนชื่อไม่สำเร็จ");
    }
  };

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: "ลบบอร์ดนี้?",
      text: "คุณจะไม่สามารถกู้คืนบอร์ดนี้ได้อีก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบบอร์ด",
      cancelButtonText: "ยกเลิก",
      background: "#1e293b",
      color: "#e2e8f0",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#475569",
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteBoard(token, id);
        await getBoards();
        toast.success("ลบบอร์ดเรียบร้อยแล้ว!");
      } catch (err) {
        toast.error(err?.response?.data?.message || "ลบไม่สำเร็จ");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Boards</h1>

        <form onSubmit={onCreate} className="flex items-center gap-2">
          <input
            className="bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="New board name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            className="inline-flex items-center gap-2 rounded-lg 
             bg-[var(--primary)] text-white px-3 py-2 text-sm
             transition-all duration-200 ease-out
             hover:bg-[var(--primary-hover)] hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]
             active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-slate-900"
            disabled={creating}
          >
            <PlusCircle size={16} />
            Create
          </button>
        </form>
      </div>

      {boards?.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
          ยังไม่มีบอร์ด — เริ่มสร้างบอร์ดแรกของคุณได้เลยด้านบน
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                {renamingId === b.id ? (
                  <input
                    autoFocus
                    className="bg-slate-900/40 border border-slate-700 rounded-lg px-2 py-1 text-sm w-full"
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onRename(b.id)}
                  />
                ) : (
                  <div className="font-medium line-clamp-2">{b.name}</div>
                )}

                <div className="flex items-center gap-1">
                  {renamingId === b.id ? (
                    <button
                      onClick={() => onRename(b.id)}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setRenamingId(b.id);
                        setRenameVal(b.name);
                      }}
                      className="p-2 rounded hover:bg-slate-700"
                      title="Rename"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(b.id)}
                    className="p-2 rounded hover:bg-rose-950/40 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                <div>Owner: {b.owner?.email}</div>
                <div>
                  Members: {b._count?.members ?? 0} • Columns:{" "}
                  {b._count?.columns ?? 0} • Tasks: {b._count?.tasks ?? 0}
                </div>
              </div>

              <button
                onClick={() => navigate(`/app/board/${b.id}`)}
                className="mt-4 inline-flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-slate-900 text-white hover:bg-slate-800"
              >
                Open <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardList;
