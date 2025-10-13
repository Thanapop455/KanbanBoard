import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useKanbanStore from "../../store/kanbanStore";
import useBoardData from "../../hooks/useBoardData.js";
import BoardHeader from "../../components/board/BoardHeader";
import MembersSection from "../../components/board/MembersSection";
import TagsSection from "../../components/board/TagsSection";
import AddColumnForm from "../../components/board/AddColumnForm";
import Column from "../../components/board/Column";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Swal from "sweetalert2";
import "../../ui/swal-theme.css";
import { swInput, swConfirm, swPrompt } from "../../ui/swal-helpers";
import { assignUser, unassignUser } from "../../api/task";

import {
  updateMemberRole,
  removeMember,
  transferOwnership,
  listMembers,
  leaveBoard,
} from "../../api/board";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} from "../../api/column";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasksInColumn,
} from "../../api/task";
import {
  createTag,
  updateTag,
  deleteTag,
  attachTag,
  detachTag,
} from "../../api/tag";
import {
  listSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../../api/subtask";

const BoardDetail = () => {
  const { id } = useParams();
  const boardId = Number(id);
  const { token, user } = useKanbanStore();
  const navigate = useNavigate();

  const {
    loading,
    board,
    members,
    tags,
    setBoard,
    setMembers,
    setTags,
    loadBoard,
    refreshColumnsTasks,
    reloadTags,
    createInviteLink,
  } = useBoardData(boardId);

  // const [newCol, setNewCol] = useState("");
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());
  const [subtasksMap, setSubtasksMap] = useState({});

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const meEmail = user?.email;
  const role = useMemo(() => {
    if (!board) return null;
    const me = board.members?.find((m) => m.user?.email === meEmail);
    return me?.role || (board.owner?.email === meEmail ? "OWNER" : null);
  }, [board, meEmail]);

  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  const canManage = isOwner || isAdmin;

  // Invite / Transfer / Leave
  const invite = async () => {
    const { value } = await Swal.fire({
      title: "เชิญสมาชิกใหม่",
      html: `
        <div style="display:flex;flex-direction:column;gap:12px;text-align:left;">
          <label style="font-weight:500;">อีเมลของผู้ใช้</label>
          <input id="invite-email" type="email" placeholder="example@email.com" class="swal2-input"/>
  
          <label style="font-weight:500;">สิทธิ์ของผู้ใช้</label>
          <div class="role-group">
            <label class="role-item">
              <input type="radio" name="role" value="MEMBER" checked />
              <span>Member</span>
            </label>
            <label class="role-item">
              <input type="radio" name="role" value="ADMIN" />
              <span>Admin</span>
            </label>
          </div>
        </div>
      `,
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      background: "#1e293b",
      color: "#e2e8f0",
      showCancelButton: true,
      confirmButtonText: "เชิญเลย",
      cancelButtonText: "ยกเลิก",
      didOpen: () => {
        // แต่งกล่อง role ให้เข้าธีม
        const style = document.createElement("style");
        style.textContent = `
          .swal2-popup .role-group { display:grid; gap:8px; }
          .swal2-popup .role-item {
            display:flex; align-items:center; gap:10px;
            padding:10px 12px; border:1px solid #334155; border-radius:8px;
            background:#0f172a; color:#e2e8f0;
          }
          .swal2-popup .role-item:hover { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.25); }
          .swal2-popup .role-item input[type="radio"] { accent-color:#6366f1; }
        `;
        document.head.appendChild(style);
      },
      preConfirm: () => {
        const email = document.getElementById("invite-email").value.trim();
        const roleEl = document.querySelector('input[name="role"]:checked');
        if (!email) {
          Swal.showValidationMessage("กรุณากรอกอีเมลก่อน");
          return false;
        }
        if (!roleEl) {
          Swal.showValidationMessage("กรุณาเลือกสิทธิ์");
          return false;
        }
        return { email, role: roleEl.value };
      },
    });

    if (!value) return;
    const { email, role } = value;
    const tokenInvite = await createInviteLink(email, role);
    const inviteLink = `${window.location.origin}/invite/${tokenInvite}`;

    await Swal.fire({
      icon: "success",
      title: "สร้างลิงก์เชิญสำเร็จ 🎉",
      html: `
        <p><b>อีเมล:</b> ${email}</p>
        <p><b>สิทธิ์:</b> ${role}</p>
        <p class="mt-2">ลิงก์เชิญ:</p>
        <pre style="background:#0f172a;color:#a5b4fc;padding:10px;border-radius:6px;overflow-x:auto;">${inviteLink}</pre>
      `,
      background: "#0f172a",
      color: "#e2e8f0",
      confirmButtonColor: "#4338ca",
    });
  };

  const handOver = async () => {
    const normEq = (a = "", b = "") =>
      a.trim().toLowerCase() === b.trim().toLowerCase();

    const handoverTargets = (members || [])
      .filter((m) => m.user?.id !== user?.id) // กันเลือกตัวเอง
      .map((m) => {
        const name = m.user?.name || "";
        const email = m.user?.email || "";
        const base =
          name && !normEq(name, email) ? `${name} • ${email}` : email;
        const rolePart = m.role ? ` (${m.role})` : "";
        return { id: m.user.id, label: `${base}${rolePart}` };
      });

    if (handoverTargets.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "ยังไม่มีสมาชิกให้โอนสิทธิ์",
        text: "เชิญสมาชิกเข้าบอร์ดก่อน",
        customClass: {
          popup: "sw-dark-popup",
          confirmButton: "sw-btn-confirm",
        },
        buttonsStyling: false,
      });
      return;
    }

    const inputOptions = handoverTargets.reduce((acc, m) => {
      acc[String(m.id)] = m.label; // ไม่มีซ้ำแล้ว
      return acc;
    }, {});

    const { value: targetIdStr } = await Swal.fire({
      title: "โอนกรรมสิทธิ์บอร์ด",
      input: "select",
      inputOptions,
      inputPlaceholder: "เลือกสมาชิกที่จะรับสิทธิ์",
      showCancelButton: true,
      confirmButtonText: "โอนกรรมสิทธิ์",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      preConfirm: (v) =>
        v ? v : (Swal.showValidationMessage("กรุณาเลือกสมาชิก"), false),
    });

    if (!targetIdStr) return;

    const targetId = Number(targetIdStr);
    const chosen =
      handoverTargets.find((x) => x.id === targetId)?.label || targetId;

    const { isConfirmed } = await Swal.fire({
      title: "ยืนยันการโอนกรรมสิทธิ์",
      text: `โอนสิทธิ์ให้: ${chosen}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
      },
      buttonsStyling: false,
    });
    if (!isConfirmed) return;

    try {
      await transferOwnership(token, boardId, targetId);
      await loadBoard();
      await Swal.fire({
        icon: "success",
        title: "โอนกรรมสิทธิ์สำเร็จ ✅",
        customClass: {
          popup: "sw-dark-popup",
          confirmButton: "sw-btn-confirm",
        },
        buttonsStyling: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถโอนได้",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด",
        customClass: {
          popup: "sw-dark-popup",
          confirmButton: "sw-btn-confirm",
        },
        buttonsStyling: false,
      });
      console.error(err);
    }
  };

  const leave = async () => {
    const ok = await swConfirm({
      title: "ออกจากบอร์ดนี้?",
      text: "คุณจะไม่ได้เห็นบอร์ดนี้ในรายการของคุณอีกต่อไป",
      confirmText: "ออกจากบอร์ด",
      icon: "question",
    });
    if (!ok) return;

    await leaveBoard(token, boardId);
    toast.info("ออกจากบอร์ดแล้ว");
    navigate("/app", { replace: true });
  };

  const changeRole = async (userId, newRole) => {
    await updateMemberRole(token, boardId, userId, newRole);
    const res = await listMembers(token, boardId);
    setMembers(res.data.members || []);
    toast.success("อัปเดตสิทธิ์แล้ว");
  };
  const kickMember = async (userId) => {
    const ok = await swConfirm({
      title: "ลบสมาชิกออกจากบอร์ด?",
      confirmText: "ลบสมาชิก",
      icon: "warning",
    });
    if (!ok) return;
    await removeMember(token, boardId, userId);
    const res = await listMembers(token, boardId);
    setMembers(res.data.members || []);
    toast.info("ลบสมาชิกแล้ว");
  };

  // Columns
  const onCreateColumn = async (e) => {
    e?.preventDefault?.();
    const res = await swInput({
      title: "สร้างคอลัมน์",
      label: "ชื่อคอลัมน์",
      placeholder: "เช่น To Do",
      confirmText: "สร้าง",
      requiredMsg: "กรุณาใส่ชื่อคอลัมน์",
    });
    if (!res.value) return;

    try {
      await createColumn(token, boardId, { name: res.value });
      // setNewCol("");
      await refreshColumnsTasks();
      toast.success("เพิ่มคอลัมน์แล้ว");
    } catch (err) {
      toast.error(err?.response?.data?.message || "เพิ่มคอลัมน์ไม่สำเร็จ");
      console.error(err);
    }
  };

  const onRenameColumn = async (columnId, currentName = "") => {
    const res = await swInput({
      title: "เปลี่ยนชื่อคอลัมน์",
      label: "ชื่อใหม่",
      defaultValue: currentName,
      confirmText: "บันทึก",
      requiredMsg: "ห้ามเว้นว่าง",
    });
    if (!res.value) return;

    await renameColumn(token, columnId, { name: res.value });
    await refreshColumnsTasks();
    toast.success("อัปเดตชื่อคอลัมน์แล้ว");
  };

  const onDeleteColumn = async (columnId) => {
    const ok = await swConfirm({
      title: "ลบคอลัมน์นี้?",
      text: "งานทั้งหมดในคอลัมน์จะถูกลบไปด้วย",
      confirmText: "ลบคอลัมน์",
    });
    if (!ok) return;

    await deleteColumn(token, columnId);
    await refreshColumnsTasks();
    toast.success("ลบคอลัมน์แล้ว");
  };

  const onCreateTask = async (columnId) => {
    const { value } = await Swal.fire({
      title: "สร้างงานใหม่",
      html: `
        <div class="sw-form">
          <div class="sw-field">
            <label class="sw-label">ชื่องาน <span class="sw-hint">(จำเป็น)</span></label>
            <input id="task-title" type="text" class="sw-ctl" placeholder="พิมพ์ชื่องาน" />
          </div>
  
          <div class="sw-field">
            <label class="sw-label">รายละเอียด</label>
            <textarea id="task-desc" class="sw-ctl textarea" placeholder="รายละเอียดงาน (ถ้ามี)"></textarea>
          </div>
  
          <div class="sw-row">
            <div class="sw-field">
              <label class="sw-label">ระดับความสำคัญ</label>
              <select id="task-priority" class="sw-ctl select">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH" selected>HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div class="sw-field">
              <label class="sw-label">กำหนดส่ง</label>
              <div class="sw-date-wrap">
                <input id="task-date" type="date" class="sw-ctl date" placeholder="mm/dd/yyyy" />
              </div>
              <span class="sw-hint">ปล่อยว่างได้ถ้ายังไม่กำหนด</span>
            </div>
          </div>
        </div>
      `,
      background: "#0f172a",
      color: "#e2e8f0",
      showCancelButton: true,
      confirmButtonText: "สร้าง",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      focusConfirm: false,

      didOpen: () => {
        // inject style เฉพาะ popup นี้
        const style = document.createElement("style");
        style.textContent = `
          .sw-form{display:flex;flex-direction:column;gap:16px;text-align:left}
          .sw-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
          @media (max-width:520px){.sw-row{grid-template-columns:1fr}}
          .sw-label{font-weight:700;color:#cbd5e1;margin-bottom:6px;display:inline-block}
          .sw-hint{font-size:12px;color:#94a3b8}
          .sw-field{display:flex;flex-direction:column;gap:6px}
          .sw-ctl{
            width:100%;background:#0b1220;border:1px solid #334155;color:#e2e8f0;
            border-radius:10px;padding:12px 14px;font-size:15px;outline:none;
            transition:border .15s ease, box-shadow .15s ease;
          }
          .sw-ctl::placeholder{color:#94a3b8}
          .sw-ctl:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.25)}
          .sw-ctl.textarea{min-height:110px;resize:vertical}
          .sw-ctl.select{
            appearance:none;padding-right:38px;
            background-image:url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5' stroke='%23a5b4fc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat:no-repeat;background-position:right 12px center;
          }
          .sw-date-wrap{position:relative}
          .sw-ctl.date{
            padding-right:38px; /* เผื่อพื้นที่ไอคอน */
            background-image:url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='4' width='18' height='17' rx='2' stroke='%23a5b4fc' stroke-width='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18' stroke='%23a5b4fc' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
            background-repeat:no-repeat;background-position:right 12px center;
          }
        `;
        document.head.appendChild(style);

        // จำกัดย้อนหลัง + โฟกัสช่องแรก + Enter เพื่อยืนยัน
        const dateEl = document.getElementById("task-date");
        dateEl.min = new Date().toISOString().split("T")[0];
        document.getElementById("task-title").focus();
        Swal.getPopup()?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") Swal.clickConfirm();
        });
      },

      preConfirm: () => {
        const title = document.getElementById("task-title").value.trim();
        const description = document.getElementById("task-desc").value.trim();
        const priority = document.getElementById("task-priority").value;
        const dueDate = document.getElementById("task-date").value;

        if (!title) {
          Swal.showValidationMessage("กรุณากรอกชื่องาน");
          return false;
        }
        return { title, description, priority, dueDate };
      },
    });

    if (!value) return;

    try {
      await createTask(token, columnId, {
        title: value.title,
        description: value.description || null,
        priority: value.priority,
        dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : null,
      });
      await refreshColumnsTasks();
      toast.success("เพิ่มงานแล้ว");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        customClass: {
          popup: "sw-dark-popup",
          confirmButton: "sw-btn-confirm",
        },
        buttonsStyling: false,
      });
    }
  };

  const onRenameTask = async (task) => {
    const res = await swInput({
      title: "เปลี่ยนชื่องาน",
      label: "ชื่อใหม่",
      defaultValue: task.title,
      confirmText: "บันทึก",
      requiredMsg: "ห้ามเว้นว่าง",
    });
    if (!res.value) return;

    await updateTask(token, task.id, { title: res.value });
    await refreshColumnsTasks();
    toast.success("อัปเดตชื่องานแล้ว");
  };

  const onDeleteTask = async (taskId) => {
    const ok = await swConfirm({
      title: "ลบงานนี้?",
      confirmText: "ลบงาน",
    });
    if (!ok) return;

    await deleteTask(token, taskId);
    await refreshColumnsTasks();
    toast.success("ลบงานแล้ว");
  };

  // Tags
  const onCreateTag = async () => {
    const nameRes = await swInput({
      title: "สร้างแท็ก",
      label: "ชื่อแท็ก",
      placeholder: "เช่น Bug, Feature",
      confirmText: "ต่อไป",
      requiredMsg: "กรุณากรอกชื่อแท็ก",
    });
    if (!nameRes.value) return;

    const colorRes = await Swal.fire({
      title: "เลือกสี (ใส่/ไม่ใส่ก็ได้)",
      input: "text",
      inputPlaceholder: "#hex เช่น #ef4444",
      showCancelButton: true,
      confirmButtonText: "สร้าง",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      preConfirm: (v) => (v?.trim() ? v.trim() : null),
    });
    if (colorRes.isDismissed) return;

    await createTag(token, boardId, {
      name: nameRes.value,
      color: colorRes.value,
    });
    await reloadTags();
    await refreshColumnsTasks();
    toast.success("สร้างแท็กแล้ว");
  };

  const onEditTag = async (tag) => {
    const nameRes = await swInput({
      title: "แก้ไขแท็ก",
      label: "ชื่อแท็ก",
      defaultValue: tag.name,
      confirmText: "ต่อไป",
      requiredMsg: "ห้ามเว้นว่าง",
    });
    if (!nameRes.value) return;

    const colorRes = await Swal.fire({
      title: "แก้สี (#hex หรือเว้นว่าง)",
      input: "text",
      inputValue: tag.color || "",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      preConfirm: (v) => (v?.trim() ? v.trim() : null),
    });
    if (colorRes.isDismissed) return;

    await updateTag(token, tag.id, {
      name: nameRes.value,
      color: colorRes.value,
    });
    await reloadTags();
    await refreshColumnsTasks();
    toast.success("อัปเดตแท็กแล้ว");
  };

  const onDeleteTag = async (tagId) => {
    const ok = await swConfirm({
      title: "ลบแท็กนี้?",
      confirmText: "ลบแท็ก",
    });
    if (!ok) return;

    await deleteTag(token, tagId);
    await reloadTags();
    await refreshColumnsTasks();
    toast.success("ลบแท็กแล้ว");
  };

  const onAttachTag = async (taskId) => {
    if (!tags.length) return toast.info("ยังไม่มีแท็ก");

    const opts = Object.fromEntries(tags.map((t) => [String(t.id), t.name]));

    const res = await Swal.fire({
      title: "เลือกแท็ก",
      input: "select",
      inputOptions: Object.fromEntries(tags.map((t) => [String(t.id), t.name])),
      inputPlaceholder: "เลือกแท็ก",
      showCancelButton: true,
      confirmButtonText: "ผูกแท็ก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      preConfirm: (v) => {
        if (!v) {
          Swal.showValidationMessage("กรุณาเลือกแท็ก");
          return false;
        }
        return Number(v);
      },
    });

    if (!res.value) return;

    await attachTag(token, taskId, res.value);
    await refreshColumnsTasks();
    toast.success("ผูกแท็กแล้ว");
  };
  // Subtasks
  const toggleSubtasks = async (taskId) => {
    const set = new Set(expandedTaskIds);
    if (set.has(taskId)) {
      set.delete(taskId);
      setExpandedTaskIds(set);
      return;
    }
    const res = await listSubtasks(token, taskId);
    setSubtasksMap((m) => ({ ...m, [taskId]: res.data.subtasks || [] }));
    set.add(taskId);
    setExpandedTaskIds(set);
  };
  const addSubtask = async (taskId) => {
    const title = await swPrompt({
      title: "เพิ่มงานย่อย",
      placeholder: "ชื่องานย่อย",
      confirmText: "เพิ่ม",
      requiredMsg: "กรุณากรอกชื่องานย่อย",
    });
    if (!title) return;

    const res = await createSubtask(token, taskId, { title });
    setSubtasksMap((m) => ({
      ...m,
      [taskId]: [...(m[taskId] || []), res.data.subtask],
    }));
    toast.success("เพิ่มงานย่อยแล้ว");
  };
  const editSubtask = async (taskId, sub) => {
    const title = await swPrompt({
      title: "แก้ชื่องานย่อย",
      value: sub.title,
      confirmText: "บันทึก",
      requiredMsg: "ห้ามเว้นว่าง",
    });
    if (title === null) return;

    const res = await updateSubtask(token, sub.id, { title });
    setSubtasksMap((m) => ({
      ...m,
      [taskId]: (m[taskId] || []).map((s) =>
        s.id === sub.id ? res.data.subtask : s
      ),
    }));
    toast.success("อัปเดตงานย่อยแล้ว");
  };
  const removeSubtask = async (taskId, id) => {
    const ok = await swConfirm({
      title: "ลบงานย่อยนี้?",
      confirmText: "ลบงานย่อย",
    });
    if (!ok) return;

    await deleteSubtask(token, id);
    setSubtasksMap((m) => ({
      ...m,
      [taskId]: (m[taskId] || []).filter((s) => s.id !== id),
    }));
    toast.info("ลบงานย่อยแล้ว");
  };

  const toggleDoneSubtask = async (taskId, sub) => {
    const res = await updateSubtask(token, sub.id, { isDone: !sub.isDone });
    setSubtasksMap((m) => ({
      ...m,
      [taskId]: (m[taskId] || []).map((s) =>
        s.id === sub.id ? res.data.subtask : s
      ),
    }));
  };
  const onDetachTag = async (taskId, tagId) => {
    await detachTag(token, taskId, tagId);
    await refreshColumnsTasks();
  };

  const onAssignAssignee = async (task) => {
    const assignedIds = new Set((task.assignees || []).map((a) => a.userId));
    const selectable = (members || [])
      .filter((m) => !assignedIds.has(m.user.id))
      .map((m) => ({
        id: m.user.id,
        label: m.user.name ? `${m.user.name} • ${m.user.email}` : m.user.email,
      }));

    if (selectable.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "ไม่มีสมาชิกให้มอบหมาย",
        text: "ทุกคนถูกมอบหมายแล้ว",
        customClass: {
          popup: "sw-dark-popup",
          confirmButton: "sw-btn-confirm",
        },
        buttonsStyling: false,
      });
      return;
    }

    const inputOptions = selectable.reduce((acc, m) => {
      acc[String(m.id)] = m.label;
      return acc;
    }, {});

    const { value: targetIdStr } = await Swal.fire({
      title: "มอบหมายงานให้",
      input: "select",
      inputOptions,
      inputPlaceholder: "เลือกสมาชิก",
      showCancelButton: true,
      confirmButtonText: "มอบหมาย",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "sw-dark-popup",
        confirmButton: "sw-btn-confirm",
        cancelButton: "sw-btn-cancel",
        validationMessage: "sw-validate",
      },
      buttonsStyling: false,
      preConfirm: (v) =>
        v ? v : (Swal.showValidationMessage("กรุณาเลือกสมาชิก"), false),
    });

    if (!targetIdStr) return;

    try {
      await assignUser(token, task.id, Number(targetIdStr));
      await refreshColumnsTasks();
      toast.success("มอบหมายงานสำเร็จ");
    } catch (err) {
      toast.error(err?.response?.data?.message || "มอบหมายไม่สำเร็จ");
    }
  };

  const onUnassignAssignee = async (taskId, userId) => {
    try {
      await unassignUser(token, taskId, userId);
      await refreshColumnsTasks();
      toast.info("ถอดผู้รับผิดชอบแล้ว");
    } catch (err) {
      toast.error(err?.response?.data?.message || "ถอดไม่สำเร็จ");
    }
  };

  if (loading) return <div className="text-slate-300">Loading board...</div>;
  if (!board) return <div className="text-rose-400">ไม่พบบอร์ด</div>;

  const onDragEnd = async ({ destination, source, draggableId, type }) => {
    if (!destination) return;
    const samePlace =
      destination.droppableId === source.droppableId &&
      destination.index === source.index;
    if (samePlace) return;

    if (type === "COLUMN") {
      // optimistic
      const nextCols = Array.from(board.columns || []);
      const [moved] = nextCols.splice(source.index, 1);
      nextCols.splice(destination.index, 0, moved);
      setBoard((p) => ({ ...p, columns: nextCols }));

      try {
        await reorderColumns(
          token,
          boardId,
          nextCols.map((c) => c.id)
        );
      } catch {
        await refreshColumnsTasks();
      }
      return;
    }

    // TASK
    const fromColId = Number(source.droppableId);
    const toColId = Number(destination.droppableId);
    const cols = board.columns || [];
    const fromCol = cols.find((c) => c.id === fromColId);
    const toCol = cols.find((c) => c.id === toColId);
    if (!fromCol || !toCol) return;

    const fromTasks = Array.from(fromCol.tasks || []);
    const toTasks =
      fromColId === toColId ? fromTasks : Array.from(toCol.tasks || []);
    const [movedTask] = fromTasks.splice(source.index, 1);
    toTasks.splice(destination.index, 0, movedTask);

    // optimistic
    setBoard((p) => ({
      ...p,
      columns: p.columns.map((c) =>
        c.id === fromColId
          ? { ...c, tasks: fromTasks }
          : c.id === toColId
          ? { ...c, tasks: toTasks }
          : c
      ),
    }));

    try {
      if (fromColId === toColId) {
        await reorderTasksInColumn(
          token,
          fromColId,
          toTasks.map((t) => t.id)
        );
      } else {
        const taskId = Number(String(draggableId).replace("task-", ""));
        await moveTask(token, taskId, {
          toColumnId: toColId,
          newIndex: destination.index,
        });
      }
    } catch {
      await refreshColumnsTasks();
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      <BoardHeader
        board={board}
        role={role}
        memberCount={members.length}
        onInvite={invite}
        onTransfer={handOver}
        onLeave={leave}
      />

      <MembersSection
        members={members}
        boardOwnerId={board.owner?.id}
        canManage={canManage}
        onChangeRole={changeRole}
        onKick={kickMember}
      />

      <TagsSection
        tags={tags}
        canManage={canManage}
        onCreate={onCreateTag}
        onEdit={onEditTag}
        onDelete={onDeleteTag}
      />
 {canManage && (
      <AddColumnForm
        // value={newCol}
        // onChange={setNewCol}
        onSubmit={onCreateColumn}
      />
    )}

      {/* Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {board.columns?.map((col, idx) => (
                <Draggable
                  key={col.id}
                  draggableId={`col-${col.id}`}
                  index={idx}
                >
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className="min-w-[300px]"
                    >
                      <Column
                        column={col}
                        canManage={canManage}
                        dragHandleProps={dragProvided.dragHandleProps} 
                        // onMoveLeft={() => moveColumn(col.id, "left")}
                        // onMoveRight={() => moveColumn(col.id, "right")}
                        onRename={() => onRenameColumn(col.id, col.name)}
                        onDelete={() => onDeleteColumn(col.id)}
                        onCreateTask={() => onCreateTask(col.id)}
                        taskHandlers={(column, t, i) => ({
                          tags,
                          canManage,
                          onRename: () => onRenameTask(t),
                          onDelete: () => onDeleteTask(t.id),
                          subtasksOpen: expandedTaskIds.has(t.id),
                          subtasks: subtasksMap[t.id] || [],
                          onToggleSubtasks: () => toggleSubtasks(t.id),
                          onAddSubtask: () => addSubtask(t.id),
                          onEditSubtask: (s) => editSubtask(t.id, s),
                          onToggleDoneSubtask: (s) =>
                            toggleDoneSubtask(t.id, s),
                          onRemoveSubtask: (sid) => removeSubtask(t.id, sid),
                          onAttachTag: () => onAttachTag(t.id),
                          onDetachTag: (tagId) => onDetachTag(t.id, tagId),
                          onAssignAssignee: () => onAssignAssignee(t),
                          onUnassignAssignee: (userId) =>
                            onUnassignAssignee(t.id, userId),
                        })}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardDetail;
