// src/utils/swalUtils.js
import Swal from "sweetalert2";

// 🎨 Theme สีหลักของระบบ (dark mode)
const THEME = {
  bg: "#1e293b",    
  fg: "#e2e8f0",     
  border: "#334155", 
  inputBg: "#0f172a", 
  confirm: "#3730a3", 
  cancel: "#475569",  
};

// ✅ Text input popup
export async function swText({ title, label, placeholder = "", initial = "" }) {
  const res = await Swal.fire({
    title,
    html: `
      <div style="display:flex;flex-direction:column;gap:10px;text-align:left;">
        ${label ? `<label style="font-weight:600;">${label}</label>` : ""}
        <input id="swal-input" class="swal2-input" placeholder="${placeholder}" 
          value="${(initial ?? "").replace(/"/g, "&quot;")}" />
      </div>
    `,
    background: THEME.bg,
    color: THEME.fg,
    showCancelButton: true,
    confirmButtonText: "ตกลง",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: THEME.confirm,
    cancelButtonColor: THEME.cancel,
    focusConfirm: false,
    didOpen: () => {
      const input = document.getElementById("swal-input");
      Object.assign(input.style, {
        width: "100%",
        height: "48px",
        padding: "12px 14px",
        fontSize: "15px",
        boxSizing: "border-box",
        borderRadius: "8px",
        border: `1px solid ${THEME.border}`,
        background: THEME.inputBg,
        color: THEME.fg,
        margin: 0,
      });
    },
    preConfirm: () => {
      const v = (document.getElementById("swal-input").value || "").trim();
      if (!v) {
        Swal.showValidationMessage("กรุณากรอกข้อมูล");
        return false;
      }
      return v;
    },
  });
  return res.value;
}

// ✅ Confirm dialog
export async function swConfirm({ title, text }) {
  const res = await Swal.fire({
    icon: "question",
    title,
    text,
    background: THEME.bg,
    color: THEME.fg,
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: THEME.confirm,
    cancelButtonColor: THEME.cancel,
  });
  return res.isConfirmed;
}

// ✅ Select dropdown popup
export async function swSelect({ title, label, options = [], initial }) {
  const res = await Swal.fire({
    title,
    html: `
      <div style="display:flex;flex-direction:column;gap:10px;text-align:left;">
        ${label ? `<label style="font-weight:600;">${label}</label>` : ""}
        <select id="swal-select" class="swal2-select">
          ${options.map(
            (o) =>
              `<option value="${o.value}" ${
                o.value === initial ? "selected" : ""
              }>${o.label}</option>`
          ).join("")}
        </select>
      </div>
    `,
    background: THEME.bg,
    color: THEME.fg,
    showCancelButton: true,
    confirmButtonText: "เลือก",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: THEME.confirm,
    cancelButtonColor: THEME.cancel,
    focusConfirm: false,
    didOpen: () => {
      const sel = document.getElementById("swal-select");
      Object.assign(sel.style, {
        width: "100%",
        height: "48px",
        padding: "10px 12px",
        fontSize: "15px",
        borderRadius: "8px",
        border: `1px solid ${THEME.border}`,
        background: THEME.inputBg,
        color: THEME.fg,
        margin: 0,
        boxSizing: "border-box",
        appearance: "none",
        cursor: "pointer",
      });
      const style = document.createElement("style");
      style.textContent = `
        .swal2-container #swal-select option {
          background: ${THEME.inputBg};
          color: ${THEME.fg};
        }
      `;
      document.head.appendChild(style);
    },
    preConfirm: () => document.getElementById("swal-select").value,
  });
  return res.value;
}
