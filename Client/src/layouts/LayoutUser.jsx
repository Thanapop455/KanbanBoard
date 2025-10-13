// src/layouts/LayoutUser.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import useKanbanStore from "../store/kanbanStore";

const LayoutUser = () => {
  const { user, logout } = useKanbanStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-700 bg-slate-800">
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          <span className="font-semibold">KanbanBoard</span>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none
               ${isActive
                 ? "bg-slate-700 text-slate-100"
                 : "text-slate-300 hover:bg-slate-700/60 hover:text-white"}`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Boards
          </NavLink>

          <NavLink
            to="/app/create"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none
               ${isActive
                 ? "bg-slate-700 text-slate-100"
                 : "text-slate-300 hover:bg-slate-700/60 hover:text-white"}`
            }
          >
            <PlusCircle className="h-4 w-4" />
            New Board
          </NavLink>
        </nav>

        <div className="mt-auto p-3 border-t border-slate-700">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm
                       text-slate-300 hover:bg-slate-700/60 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="md:hidden font-semibold">KanbanBoard</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {user?.name || user?.email}
            </span>
            <img
              className="h-8 w-8 rounded-full ring-1 ring-slate-600"
              alt="avatar"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || user?.email || "User"
              )}&background=1e293b&color=fff`} // โทนเข้ม
            />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutUser;
