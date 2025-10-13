const prisma = require("../config/prisma");

// ---------- helpers ----------
function assert(ok, status, msg) {
  if (!ok) { const e = new Error(msg); e.status = status; throw e; }
}

async function getBoardRole(userId, boardId) {
  const board = await prisma.board.findUnique({
    where: { id: Number(boardId) },
    include: {
      owner: { select: { id: true } },
      members: { where: { userId }, select: { role: true, userId: true } },
    },
  });
  if (!board) return { board: null, role: null, isOwner: false, isMember: false };
  const isOwner = board.owner.id === userId;
  const membership = board.members[0] || null;
  const role = isOwner ? "OWNER" : membership?.role || null;
  return { board, role, isOwner, isMember: Boolean(isOwner || membership) };
}

async function nextSubtaskPos(taskId) {
  const last = await prisma.subtask.findFirst({
    where: { taskId: Number(taskId) },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? 0) + 1;
}

// ---------- controllers ----------

// GET /tasks/:taskId/subtasks
exports.listSubtasks = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  const subtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: { position: "asc" },
  });

  res.json({ subtasks });
};

// POST /tasks/:taskId/subtasks
exports.createSubtask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const { title } = req.body || {};

  assert(title?.trim(), 400, "Title is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  const pos = await nextSubtaskPos(taskId);

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: title.trim(),
      position: pos,
    },
  });

  res.status(201).json({ subtask });
};

// PUT /subtasks/:id   (แก้ชื่อ / ติ๊กสำเร็จ)
exports.updateSubtask = async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const { title, isDone } = req.body || {};

  const subtask = await prisma.subtask.findUnique({ where: { id } });
  assert(subtask, 404, "Subtask not found");

  // ตรวจสิทธิ์ตามบอร์ดของ task ที่ subtask สังกัด
  const task = await prisma.task.findUnique({ where: { id: subtask.taskId } });
  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  if (title !== undefined) assert(title?.trim(), 400, "Invalid title");

  const updated = await prisma.subtask.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(isDone !== undefined ? { isDone: Boolean(isDone) } : {}),
    },
  });

  res.json({ subtask: updated });
};

// DELETE /subtasks/:id
exports.deleteSubtask = async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  const subtask = await prisma.subtask.findUnique({ where: { id } });
  assert(subtask, 404, "Subtask not found");

  const task = await prisma.task.findUnique({ where: { id: subtask.taskId } });
  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  await prisma.subtask.delete({ where: { id } });
  res.json({ message: "Subtask deleted" });
};

// PATCH /tasks/:taskId/subtasks/reorder   { order: [subtaskId1, subtaskId2, ...] }
exports.reorderSubtasks = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const { order } = req.body || {};
  assert(Array.isArray(order) && order.length > 0, 400, "Order array required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  // ตรวจว่า id ทั้งหมดเป็นของ task นี้จริง
  const subs = await prisma.subtask.findMany({ where: { id: { in: order } } });
  const allBelong = subs.every(s => s.taskId === taskId);
  assert(allBelong && subs.length === order.length, 400, "Invalid subtasks");

  await prisma.$transaction(
    order.map((id, idx) =>
      prisma.subtask.update({
        where: { id: Number(id) },
        data: { position: idx + 1 },
      })
    )
  );

  res.json({ message: "Subtasks reordered" });
};
