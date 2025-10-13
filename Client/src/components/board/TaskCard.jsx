// src/components/board/TaskCard.jsx
import React from "react";
import { Pencil, Trash2, Calendar, Hash, UserPlus } from "lucide-react";
import Subtasks from "./Subtasks";

const TaskCard = ({
  task,
  tags,
  onRename,
  onDelete,
  subtasksOpen,
  subtasks,
  onToggleSubtasks,
  onAddSubtask,
  onEditSubtask,
  onToggleDoneSubtask,
  onRemoveSubtask,
  onAttachTag,
  onDetachTag,
  // ⬇️ เพิ่ม 3 props
  canManage,
  onAssignAssignee,
  onUnassignAssignee,
}) => {
  const assignees = task.assignees || []; // [{ userId, user:{id,email,name}}]

  return (
    <div className="rounded-lg border border-slate-700 p-3 bg-slate-800/80">
      {/* หัวการ์ด */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{task.title}</div>
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              onClick={onRename}
              className="p-1 rounded hover:bg-slate-700"
              title="Rename task"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-rose-950/40 text-rose-400"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* แถว meta: priority / dueDate / tags */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        {task.priority && (
          <span className="inline-flex items-center gap-1">
            <Hash size={12} /> {task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}

        {task.tags?.map((tg) => (
          <span
            key={tg.tagId}
            className="px-2 py-0.5 rounded-full border bg-slate-900/40 inline-flex items-center gap-1"
            style={{ borderColor: tg.tag?.color || "#334155" }}
          >
            {tg.tag?.name}
            <button
              onClick={() => onDetachTag(tg.tagId)}
              className="text-slate-400 hover:text-slate-200 ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <button
          onClick={onAttachTag}
          className="text-indigo-400 hover:underline"
        >
          + Tag
        </button>
      </div>

      {/* แถว Assignees */}
      <div className="mt-3">
        <div className="text-xs text-slate-400 mb-1">Assignees</div>

        {assignees.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {assignees.map((a) => (
              <span
                key={a.userId}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/50 border border-slate-700 px-2 py-1 text-xs"
              >
                <img
                  className="h-5 w-5 rounded-full"
                  alt=""
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    a.user?.name || a.user?.email || "User"
                  )}&background=1f2937&color=f8fafc`}
                />
                <span className="text-slate-200">
                  {a.user?.name || a.user?.email}
                </span>
                {canManage && (
                  <button
                    onClick={() => onUnassignAssignee(a.userId)}
                    className="text-slate-400 hover:text-slate-200"
                    title="Remove assignee"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400">ยังไม่มีผู้รับผิดชอบ</div>
        )}

        {canManage && (
          <button
            onClick={onAssignAssignee}
            className="mt-2 inline-flex items-center gap-1 text-indigo-400 hover:underline text-sm"
          >
            <UserPlus size={14} /> มอบหมายผู้รับผิดชอบ
          </button>
        )}
      </div>

      <Subtasks
        isOpen={subtasksOpen}
        subtasks={subtasks}
        onToggle={onToggleSubtasks}
        onAdd={onAddSubtask}
        onEdit={onEditSubtask}
        onToggleDone={onToggleDoneSubtask}
        onRemove={onRemoveSubtask}
      />
    </div>
  );
};

export default TaskCard;
