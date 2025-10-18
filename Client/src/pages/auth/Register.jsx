import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, UserPlus } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email({ message: "อีเมลไม่ถูกต้อง" }),
    password: z.string().min(8, { message: "รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const [passwordScore, setPasswordScore] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const pwd = watch("password");
  useEffect(() => setPasswordScore(zxcvbn(pwd || "").score), [pwd]);

  const onSubmit = async (form) => {
    try {
      await axios.post("https://kanbanboard-nsud.onrender.com/api/register", {
        email: form.email,
        password: form.password,
      });
      toast.success("สมัครสมาชิกสำเร็จ");
      reset();
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ";
      toast.error(msg);
      console.error(err);
    }
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-white/90">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/90 shadow-md">
              <UserPlus size={18} />
            </span>
            <h1 className="text-xl font-semibold tracking-wide">Create account</h1>
          </div>
          <p className="text-sm text-white/50 mt-2">
            สมัครสมาชิกเพื่อเริ่มสร้างบอร์ดงานของคุณ
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-4">Register</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <label className="block">
              <span className="text-sm text-white/70">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full rounded-lg bg-white/10 border pl-9 pr-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400 ${
                    errors.email ? "border-red-500/60" : "border-white/10"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm text-white/70">Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className={`w-full rounded-lg bg-white/10 border pl-9 pr-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400 ${
                    errors.password ? "border-red-500/60" : "border-white/10"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}

              {/* Password strength */}
              {pwd?.length > 0 && (
                <div className="flex mt-2 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const color =
                      passwordScore <= 2
                        ? "bg-red-500"
                        : passwordScore < 4
                        ? "bg-yellow-500"
                        : "bg-green-500";
                    return <div key={i} className={`h-1.5 flex-1 rounded ${color}`} />;
                  })}
                </div>
              )}
            </label>

            {/* Confirm */}
            <label className="block">
              <span className="text-sm text-white/70">Confirm Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className={`w-full rounded-lg bg-white/10 border pl-9 pr-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400 ${
                    errors.confirmPassword ? "border-red-500/60" : "border-white/10"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </label>

            <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 transition text-white font-medium py-2.5">
              Register
            </button>
          </form>

          <p className="text-sm text-white/60 mt-4 text-center">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="text-emerald-300 hover:underline">
              เข้าสู่ระบบ
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

export default Register;
