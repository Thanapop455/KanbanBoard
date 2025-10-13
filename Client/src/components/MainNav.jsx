// src/components/MainNav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Menu,
  KanbanSquare,
} from "lucide-react";
import useKanbanStore from "../store/kanbanStore";
import { toast } from "react-toastify";

const MainNav = () => {
  const navigate = useNavigate();
  const user = useKanbanStore((s) => s.user);
  const logout = useKanbanStore((s) => s.logout);

  const [isOpen, setIsOpen] = useState(false);    
  const [mobileOpen, setMobileOpen] = useState(false); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const linkBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors";
  const navActive = "bg-white/15 text-white shadow-sm";
  const navIdle = "text-white/80 hover:text-white hover:bg-white/10";

  return (
    <header className="sticky top-0 z-50">
      {/* gradient underlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-700/70 via-sky-700/60 to-violet-700/70 blur-[80px] h-24" />
      <nav className="backdrop-blur bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          {/* Left: logo + links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2 text-white"
              aria-label="KanbanBoard Home"
            >
              <span className="grid place-items-center w-9 h-9 rounded-2xl bg-white/10 border border-white/15 group-hover:bg-white/15 transition">
                <KanbanSquare className="w-5 h-5" />
              </span>
              <span className="font-semibold tracking-wide">KanbanBoard</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/app"
                  end
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? navActive : navIdle}`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Boards
                </NavLink>

                <NavLink
                  to="/app/create"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? navActive : navIdle}`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  New Board
                </NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5"
                >
                  <img
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || user.email || "User"
                    )}&background=random`}
                  />
                  <span className="hidden sm:block text-sm">
                    {user.name || user.email}
                  </span>
                  <ChevronDown size={16} className="opacity-80" />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                        toast.info("ออกจากระบบเรียบร้อยแล้ว");
                        navigate("/login");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="px-3 py-2 text-sm rounded-xl text-white/85 hover:text-white hover:bg-white/10"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-3 py-2 text-sm rounded-xl bg-white text-slate-900 hover:bg-slate-100 shadow-sm"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* mobile drawer */}
        {user && mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/80 backdrop-blur">
            <div className="px-3 py-3 flex flex-col gap-2">
              <NavLink
                to="/app"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Boards
              </NavLink>
              <NavLink
                to="/app/create"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`
                }
              >
                <PlusCircle className="w-4 h-4" />
                New Board
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default MainNav;
