import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, LogIn } from "lucide-react";
import useKanbanStore from "../../store/kanbanStore";

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useKanbanStore((s) => s.actionLogin);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actionLogin(form);
      toast.success("Welcome back!");
      navigate("/app");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-white/90">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/90 shadow-md">
              <LogIn size={18} />
            </span>
            <h1 className="text-xl font-semibold tracking-wide">KanbanBoard</h1>
          </div>
          <p className="text-sm text-white/50 mt-2">
            จัดการบอร์ดงานของคุณได้ในที่เดียว
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-4">เข้าสู่ระบบ</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-white/70">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="you@example.com"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-white/70">Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="••••••••"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>
            </label>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 transition text-white font-medium py-2.5 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-white/60 mt-4 text-center">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="text-blue-300 hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-white/40 mt-6">
          © {new Date().getFullYear()} KanbanBoard
        </p>
      </div>
    </div>
  );
};

export default Login;
