import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const Subtasks = ({ isOpen, subtasks, onToggle, onAdd, onEdit, onToggleDone, onRemove }) => {
  return (
    <div className="mt-2">
      <button className="text-xs text-slate-300 hover:underline" onClick={onToggle}>
        {isOpen ? "Hide subtasks" : "Show subtasks"}
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1">
          {(subtasks || []).map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm bg-slate-800 rounded border border-slate-700 px-2 py-1">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!s.isDone} onChange={() => onToggleDone(s)} />
                <span className={s.isDone ? "line-through text-slate-500" : ""}>{s.title}</span>
              </label>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(s)} className="p-1 rounded hover:bg-slate-700">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onRemove(s.id)} className="p-1 rounded hover:bg-rose-950/40 text-rose-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={onAdd} className="text-xs text-indigo-400 hover:underline">
            + Add subtask
          </button>
        </div>
      )}
    </div>
  );
};

export default Subtasks;
