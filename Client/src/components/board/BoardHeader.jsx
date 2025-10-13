import React from "react";
import { Crown, Link as LinkIcon, LogOut } from "lucide-react";

const BoardHeader = ({
  board,
  role,
  onInvite,
  onTransfer,
  onLeave,
  memberCount,
}) => {
  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div>
        <h1 className="text-xl font-semibold">{board.name}</h1>
        <p className="text-xs text-slate-400">
          Owner: {board.owner?.email} • Members: {memberCount}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {(isOwner || isAdmin) && (
          <button
            onClick={onInvite}
            className="rounded-lg bg-slate-700 text-white px-3 py-2 text-sm hover:bg-slate-600 inline-flex items-center gap-2"
          >
            <LinkIcon size={16} /> Invite
          </button>
        )}
        {isOwner && (
          <button
            onClick={onTransfer}
            className="rounded-lg bg-amber-600 text-white px-3 py-2 text-sm hover:bg-amber-500 inline-flex items-center gap-2"
          >
            <Crown size={16} /> Transfer Owner
          </button>
        )}
        {!isOwner && (
          <button
            onClick={onLeave}
            className="rounded-lg bg-rose-500 text-slate-100 px-3 py-2 text-sm hover:bg-rose-400 inline-flex items-center gap-2"
          >
            <LogOut size={16} /> Leave
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardHeader;
