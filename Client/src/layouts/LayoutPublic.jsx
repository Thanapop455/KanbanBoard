import React from "react";
import { Outlet, Link } from "react-router-dom";

const LayoutPublic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 text-slate-100">
      {/* topbar */}
      <header className="border-b border-slate-700/80 bg-slate-900/70 backdrop-blur sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-wide">
            KanbanBoard
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="hover:text-white/80">Login</Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutPublic;
