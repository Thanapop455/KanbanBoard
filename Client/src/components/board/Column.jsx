import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import TaskCard from "./TaskCard";

const Column = ({
  column,
  canManage,
  onRename,
  onDelete,
  onCreateTask,
  taskHandlers,
  dragHandleProps,
}) => {
  return (
    <div className="w-80 rounded-xl border border-slate-700 bg-slate-800">
      <div
        className="px-3 py-2 border-b border-slate-700 flex items-center justify-between"
        {...dragHandleProps}
      >
        <div className="font-medium">{column.name}</div>
        <div className="flex items-center gap-1">
          {canManage && (
            <>
              <button
                onClick={onRename}
                className="p-1 rounded hover:bg-slate-700"
                title="Rename column"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-rose-950/40 text-rose-400"
                title="Delete column"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <Droppable droppableId={String(column.id)} type="TASK">
        {(provided, snapshot) => (
          <div
            className={`p-3 space-y-2 ${
              snapshot.isDraggingOver ? "bg-slate-900/40" : ""
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {column.tasks?.length ? (
              column.tasks.map((t, i) => (
                <Draggable key={t.id} draggableId={`task-${t.id}`} index={i}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                    >
                      <TaskCard canManage={canManage} task={t} {...taskHandlers(column, t, i)} />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="text-xs text-slate-400">ยังไม่มีงาน</div>
            )}

            {provided.placeholder}

            <button
              onClick={onCreateTask}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 border-dashed py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              <PlusCircle size={16} />
              Add task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
