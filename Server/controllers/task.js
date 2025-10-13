const prisma = require("../config/prisma");

function assert(ok, status, msg) {
  if (!ok) {
    const e = new Error(msg);
    e.status = status;
    throw e;
  }
}

async function getBoardRole(userId, boardId) {
  const board = await prisma.board.findUnique({
    where: { id: Number(boardId) },
    include: {
      owner: { select: { id: true } },
      members: { where: { userId }, select: { role: true, userId: true } },
    },
  });
  if (!board)
    return { board: null, role: null, isOwner: false, isMember: false };
  const isOwner = board.owner.id === userId;
  const membership = board.members[0] || null;
  const role = isOwner ? "OWNER" : membership?.role || null;
  return { board, role, isOwner, isMember: Boolean(isOwner || membership) };
}

// คำนวณตำแหน่งถัดไปของ task ในคอลัมน์ (เรียงเป็น 1..n)
async function getNextTaskPosition(columnId) {
  const last = await prisma.task.findFirst({
    where: { columnId: Number(columnId) },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? 0) + 1;
}

// จัดตำแหน่งใหม่ตาม array (เขียนทับเป็น 1..n)
async function writeSequentialPositions(taskIds) {
  return prisma.$transaction(
    taskIds.map((id, idx) =>
      prisma.task.update({
        where: { id: Number(id) },
        data: { position: idx + 1 },
      })
    )
  );
}

// ---------- controllers ----------

// GET /boards/:boardId/tasks   (option: ?columnId= &status= &q=)
exports.listTasks = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);
  const { columnId, status, q } = req.query;

  const { isMember } = await getBoardRole(userId, boardId);
  assert(isMember, 403, "No permission");

  const where = {
    boardId,
    ...(columnId ? { columnId: Number(columnId) } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: String(q), mode: "insensitive" } },
            { description: { contains: String(q), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
    include: {
      assignees: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
      tags: { include: { tag: true } },
      subtasks: { orderBy: { position: "asc" } },
    },
  });

  res.json({ tasks });
};

// POST /columns/:columnId/tasks
exports.createTask = async (req, res) => {
  const userId = req.user.id;
  const columnId = Number(req.params.columnId);
  const { title, description, priority, dueDate } = req.body;

  assert(title?.trim(), 400, "Title is required");

  const column = await prisma.column.findUnique({ where: { id: columnId } });
  assert(column, 404, "Column not found");

  const { isMember } = await getBoardRole(userId, column.boardId);
  assert(isMember, 403, "No permission");

  const pos = await getNextTaskPosition(columnId);

  const task = await prisma.task.create({
    data: {
      boardId: column.boardId,
      columnId,
      title: title.trim(),
      description: description ?? null,
      priority: priority ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: userId,
      position: pos,
    },
  });

  res.status(201).json({ task });
};

// PUT /tasks/:id   (อัปเดตชื่อ/คำอธิบาย/priority/dueDate/status)
exports.updateTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);
  const payload = (({ title, description, priority, dueDate, status }) => ({
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(priority !== undefined ? { priority } : {}),
    ...(dueDate !== undefined
      ? { dueDate: dueDate ? new Date(dueDate) : null }
      : {}),
    ...(status !== undefined ? { status } : {}),
  }))(req.body || {});

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  if (payload.title) assert(payload.title.trim(), 400, "Invalid title");

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...payload,
      ...(payload.title ? { title: payload.title.trim() } : {}),
    },
  });

  res.json({ task: updated });
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  await prisma.task.delete({ where: { id: taskId } });
  res.json({ message: "Task deleted" });
};

// PATCH /tasks/:id/move   { toColumnId, newIndex }
// newIndex = ตำแหน่งใหม่ในคอลัมน์ปลายทาง (0-based)
exports.moveTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);
  const { toColumnId, newIndex } = req.body;

  assert(toColumnId, 400, "toColumnId is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const targetCol = await prisma.column.findUnique({
    where: { id: Number(toColumnId) },
  });
  assert(targetCol, 404, "Target column not found");

  // ต้องเป็นสมาชิกบอร์ดเดียวกัน
  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");
  assert(task.boardId === targetCol.boardId, 400, "Cannot move across boards");

  // เอารายการ task id ในคอลัมน์ปลายทาง (ยกเว้นตัวเอง)
  const targetTasks = await prisma.task.findMany({
    where: { columnId: targetCol.id, id: { not: taskId } },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  const ids = targetTasks.map((t) => t.id);

  const insertAt = Math.max(
    0,
    Math.min(Number(newIndex ?? ids.length), ids.length)
  );
  ids.splice(insertAt, 0, taskId);

  await prisma.$transaction(async (tx) => {
    // อัปเดต columnId ให้ task (ถ้าย้ายคอลัมน์)
    if (task.columnId !== targetCol.id) {
      await tx.task.update({
        where: { id: taskId },
        data: { columnId: targetCol.id },
      });
    }
    // เขียนตำแหน่งใหม่ทั้งหมด
    await Promise.all(
      ids.map((id, idx) =>
        tx.task.update({ where: { id }, data: { position: idx + 1 } })
      )
    );
  });

  res.json({ message: "Task moved" });
};

// PATCH /columns/:columnId/tasks/reorder  { order: [taskId1, taskId2, ...] }
exports.reorderTasksInColumn = async (req, res) => {
  const userId = req.user.id;
  const columnId = Number(req.params.columnId);
  const { order } = req.body;

  assert(Array.isArray(order) && order.length > 0, 400, "Order array required");

  const col = await prisma.column.findUnique({ where: { id: columnId } });
  assert(col, 404, "Column not found");

  const { isMember } = await getBoardRole(userId, col.boardId);
  assert(isMember, 403, "No permission");

  // ตรวจว่า id ทั้งหมดเป็นของคอลัมน์นี้จริง
  const tasks = await prisma.task.findMany({ where: { id: { in: order } } });
  const allInColumn = tasks.every((t) => t.columnId === columnId);
  assert(allInColumn && tasks.length === order.length, 400, "Invalid tasks");

  await writeSequentialPositions(order);

  res.json({ message: "Tasks reordered" });
};

// (Optional) Assign/Unassign ผู้รับผิดชอบในงาน — เผื่อคุณอยากเปิดใช้งาน
// POST /tasks/:id/assignees { userId }
exports.assignUser = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);
  const { userId: targetUserId } = req.body;

  assert(targetUserId, 400, "userId is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  // เป้าหมายต้องเป็นสมาชิกบอร์ดด้วย
  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: { boardId: task.boardId, userId: Number(targetUserId) },
    },
  });
  assert(member, 400, "Target user is not a board member");

  await prisma.taskAssignee.create({
    data: { taskId, userId: Number(targetUserId) },
  });

  res.status(201).json({ message: "Assignee added" });
};

// DELETE /tasks/:id/assignees/:userId
exports.unassignUser = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  await prisma.taskAssignee.delete({
    where: { taskId_userId: { taskId, userId: targetUserId } },
  });

  res.json({ message: "Assignee removed" });
};

exports.listAssignees = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.id);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  const assignees = await prisma.taskAssignee.findMany({
    where: { taskId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { assignedAt: "asc" },
  });

  res.json({ assignees });
};
