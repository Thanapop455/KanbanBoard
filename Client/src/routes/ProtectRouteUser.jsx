// src/routes/ProtectRouteUser.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useKanbanStore from "../store/kanbanStore";
import { currentUser } from "../api/auth";

const ProtectRouteUser = ({ element }) => {
  const user = useKanbanStore((s) => s.user);
  const token = useKanbanStore((s) => s.token);
  const location = useLocation();

  // null = ยังตรวจอยู่, true = ผ่าน, false = ไม่ผ่าน
  const [ok, setOk] = useState(null);

  useEffect(() => {
    if (!token) {
      setOk(false);
      return;
    }
    let alive = true;
    currentUser(token)
      .then(() => {
        if (alive) setOk(true);
      })
      .catch(() => {
        if (alive) setOk(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const next = encodeURIComponent(location.pathname + location.search);

  if (!user || !token) return <Navigate to={`/login?next=${next}`} replace />;
  if (ok === false) return <Navigate to="/login" replace />;
  if (ok === null) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-500 animate-pulse" />
          <span className="h-3 w-3 rounded-full bg-slate-500 animate-pulse [animation-delay:120ms]" />
          <span className="h-3 w-3 rounded-full bg-slate-500 animate-pulse [animation-delay:240ms]" />
          <span className="ml-2 text-sm">กำลังตรวจสอบสิทธิ์…</span>
        </div>
      </div>
    );
  }

  // ผ่านแล้ว
  return element;
};

export default ProtectRouteUser;
