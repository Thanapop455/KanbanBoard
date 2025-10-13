// import Swal from "sweetalert2";
// import "./swal-theme.css";

//  const swInput = (opts) =>
//     Swal.fire({
//       input: "text",
//       inputValue: opts.defaultValue ?? "",
//       inputLabel: opts.label ?? "",
//       inputPlaceholder: opts.placeholder ?? "",
//       title: opts.title ?? "",
//       showCancelButton: true,
//       confirmButtonText: opts.confirmText ?? "ตกลง",
//       cancelButtonText: "ยกเลิก",
//       customClass: {
//         popup: "sw-dark-popup",
//         confirmButton: "sw-btn-confirm",
//         cancelButton: "sw-btn-cancel",
//         validationMessage: "sw-validate",
//       },
//       buttonsStyling: false,
//       preConfirm: (v) => {
//         const value = (v ?? "").trim();
//         if (!value) {
//           Swal.showValidationMessage(opts.requiredMsg ?? "กรุณากรอกข้อมูล");
//           return false;
//         }
//         if (opts.validate) {
//           const err = opts.validate(value);
//           if (err) {
//             Swal.showValidationMessage(err);
//             return false;
//           }
//         }
//         return value;
//       },
      
//     });
//     const swConfirm = async ({
//       title = "ยืนยันการทำรายการ",
//       text,
//       confirmText = "ยืนยัน",
//       cancelText = "ยกเลิก",
//       icon = "warning",
//     } = {}) => {
//       const { isConfirmed } = await Swal.fire({
//         icon,
//         title,
//         text,
//         showCancelButton: true,
//         confirmButtonText: confirmText,
//         cancelButtonText: cancelText,
//         reverseButtons: false,     // ย้ายปุ่มยืนยันไปซ้าย
//         focusCancel: false,
//         focusConfirm: true,       // โฟกัสปุ่มยืนยัน
//         // allowOutsideClick: false,
//         // allowEscapeKey: false,
//         customClass: {
//           popup: "sw-dark-popup",
//           confirmButton: "sw-btn-confirm",
//           cancelButton: "sw-btn-cancel",
//         },
//         buttonsStyling: false,
//       });
//       return isConfirmed;
//     };
//     const swPrompt = async ({
//       title,
//       value = "",
//       placeholder = "",
//       confirmText = "บันทึก",
//       requiredMsg = "กรุณากรอกข้อมูล",
//     } = {}) => {
//       const { value: v } = await Swal.fire({
//         title,
//         input: "text",
//         inputValue: value,
//         inputPlaceholder: placeholder,
//         showCancelButton: true,
//         confirmButtonText: confirmText,
//         cancelButtonText: "ยกเลิก",
//         customClass: {
//           popup: "sw-dark-popup",
//           confirmButton: "sw-btn-confirm",
//           cancelButton: "sw-btn-cancel",
//           validationMessage: "sw-validate",
//         },
//         buttonsStyling: false,
//         preConfirm: (x) => {
//           const t = (x || "").trim();
//           if (!t) {
//             Swal.showValidationMessage(requiredMsg);
//             return false;
//           }
//           return t;
//         },
//       });
//       return v ?? null;
//     };

// src/ui/swal-helpers.js
import Swal from "sweetalert2";
import "./swal-theme.css";

// ใช้ mixin กลาง บังคับ confirm อยู่ซ้ายทุกที่
export const Sw = Swal.mixin({
  customClass: {
    popup: "sw-dark-popup",
    confirmButton: "sw-btn-confirm",
    cancelButton: "sw-btn-cancel",
    validationMessage: "sw-validate",
  },
  buttonsStyling: false,
  showCancelButton: true,
  reverseButtons: false,
  focusConfirm: true,
});

export const swInput = (opts = {}) =>
  Sw.fire({
    input: "text",
    inputValue: opts.defaultValue ?? "",
    inputLabel: opts.label ?? "",
    inputPlaceholder: opts.placeholder ?? "",
    title: opts.title ?? "",
    confirmButtonText: opts.confirmText ?? "ตกลง",
    cancelButtonText: "ยกเลิก",
    preConfirm: (v) => {
      const value = (v ?? "").trim();
      if (!value) {
        Sw.showValidationMessage(opts.requiredMsg ?? "กรุณากรอกข้อมูล");
        return false;
      }
      if (typeof opts.validate === "function") {
        const err = opts.validate(value);
        if (err) {
          Sw.showValidationMessage(err);
          return false;
        }
      }
      return value;
    },
  });

export const swConfirm = async ({
  title = "ยืนยันการทำรายการ",
  text,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  icon = "warning",
} = {}) => {
  const { isConfirmed } = await Sw.fire({
    icon,
    title,
    text,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return isConfirmed;
};

export const swPrompt = async ({
  title,
  value = "",
  placeholder = "",
  confirmText = "บันทึก",
  requiredMsg = "กรุณากรอกข้อมูล",
} = {}) => {
  const { value: v } = await Sw.fire({
    title,
    input: "text",
    inputValue: value,
    inputPlaceholder: placeholder,
    confirmButtonText: confirmText,
    cancelButtonText: "ยกเลิก",
    preConfirm: (x) => {
      const t = (x || "").trim();
      if (!t) {
        Sw.showValidationMessage(requiredMsg);
        return false;
      }
      return t;
    },
  });
  return v ?? null;
};

// (จะ export default ก็ได้ถ้าชอบ)
// export default { Sw, swInput, swConfirm, swPrompt };
