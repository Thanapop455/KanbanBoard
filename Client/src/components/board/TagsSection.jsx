import React from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

const TagsSection = ({ tags, canManage, onCreate, onEdit, onDelete }) => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Tags</div>
        {canManage && (
          <button onClick={onCreate} className="inline-flex items-center gap-2 rounded bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-sm">
            <PlusCircle size={16} /> Tag
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tg) => (
          <span
            key={tg.id}
            className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm bg-slate-900/40"
            style={{ borderColor: tg.color || "#334155" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: tg.color || "#64748b" }} />
            {tg.name}
            {canManage && (
              <>
                <button onClick={() => onEdit(tg)} className="text-slate-300 hover:text-slate-100">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete(tg.id)} className="text-rose-400 hover:text-rose-300">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;
