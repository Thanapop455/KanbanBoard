// src/pages/invite/InviteAccept.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useKanbanStore from "../../store/kanbanStore";
import { acceptInvite } from "../../api/board";
import { Sw } from "../../ui/swal-helpers";

const InviteAccept = () => {
  const { token: tokenFromPath } = useParams(); // /invite/:token
  const location = useLocation();
  const navigate = useNavigate();
  const { token: authToken } = useKanbanStore();
  const [msg, setMsg] = useState("กำลังยืนยันคำเชิญ...");
  const didRun = useRef(false);               // 👈 กันรอบสองจาก StrictMode

  useEffect(() => {
    if (didRun.current) return;               // 👈 ถ้าเคยรันแล้ว ไม่ให้รันซ้ำ
    didRun.current = true;

    // อ่าน token จาก path หรือ query
    const query = new URLSearchParams(location.search);
    const tokenFromQuery = query.get("token") || query.get("invite");
    const inviteToken = tokenFromPath || tokenFromQuery;

    if (!inviteToken) {
      navigate("/app", { replace: true });
      return;
    }

    if (!authToken) {
      setMsg("กรุณาเข้าสู่ระบบก่อน แล้วเปิดลิงก์นี้อีกครั้ง");
      // เก็บเส้นทางเดิมไว้ให้เด้งกลับหลังล็อกอิน
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await acceptInvite(authToken, inviteToken);
        const boardId = res?.data?.board?.id ?? res?.data?.boardId;
        toast.success("เข้าร่วมบอร์ดสำเร็จ!");
        navigate(boardId ? `/app/board/${boardId}` : "/app", { replace: true });
      } catch (err) {
        const message = err?.response?.data?.message || "โทเคนไม่ถูกต้องหรือหมดอายุ";
        await Sw.fire({ icon: "error", title: "เข้าร่วมไม่สำเร็จ", text: message });
        setMsg(message);
        navigate("/app", { replace: true });
      }
    })();

  }, []); // 👈 รันครั้งเดียวพอ


  return (
    <div className="p-6 text-center text-slate-300">
      <p>{msg}</p>
    </div>
  );
};

export default InviteAccept;
