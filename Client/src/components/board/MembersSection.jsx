import React from "react";
import { UserMinus } from "lucide-react";

const MembersSection = ({ members, boardOwnerId, canManage, onChangeRole, onKick }) => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="font-medium mb-2">Members</div>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.user.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img
                className="h-7 w-7 rounded-full"
                src={`https://ui-avatars.com/api/?background=1f2937&color=f8fafc&name=${encodeURIComponent(m.user.name || m.user.email)}`}
                alt=""
              />
              <div>
                <div>{m.user.name || m.user.email}</div>
                <div className="text-xs text-slate-400">{m.role}</div>
              </div>
            </div>
            {canManage && m.user.id !== boardOwnerId && (
              <div className="flex items-center gap-2">
                <select
                  className="bg-slate-900/40 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  value={m.role}
                  onChange={(e) => onChangeRole(m.user.id, e.target.value)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                </select>
                <button onClick={() => onKick(m.user.id)} className="p-2 rounded hover:bg-rose-950/40 text-rose-400" title="Remove">
                  <UserMinus size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersSection;
