import React from "react";
import { PlusCircle } from "lucide-react";

const AddColumnForm = ({ onSubmit }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-sm disabled:opacity-60"
      >
        <PlusCircle size={16} />
        Add Column
      </button>
    </div>
  );
};

export default AddColumnForm;
