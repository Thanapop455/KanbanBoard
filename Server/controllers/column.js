const prisma = require("../config/prisma");

// ===== helpers =====
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

// ===== controllers =====

// GET /boards/:boardId/columns
exports.listColumns = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);

  const { isMember } = await getBoardRole(userId, boardId);
  assert(isMember, 403, "No permission");

  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });
  res.json({ columns });
};

// POST /boards/:boardId/columns
exports.createColumn = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);
  const { name } = req.body;

  assert(name?.trim(), 400, "Name is required");

  const { role, isOwner } = await getBoardRole(userId, boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can create");

  // next position = max + 1
  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const nextPos = (last?.position ?? 0) + 1;

  const column = await prisma.column.create({
    data: { boardId, name: name.trim(), position: nextPos },
  });
  res.status(201).json({ column });
};

// PUT /columns/:id   (rename)
exports.renameColumn = async (req, res) => {
  const userId = req.user.id;
  const columnId = Number(req.params.id);
  const { name } = req.body;
  assert(name?.trim(), 400, "Name is required");

  const column = await prisma.column.findUnique({ where: { id: columnId } });
  assert(column, 404, "Column not found");

  const { role, isOwner } = await getBoardRole(userId, column.boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can rename");

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: { name: name.trim() },
  });
  res.json({ column: updated });
};

// DELETE /columns/:id
exports.deleteColumn = async (req, res) => {
  const userId = req.user.id;
  const columnId = Number(req.params.id);

  const column = await prisma.column.findUnique({ where: { id: columnId } });
  assert(column, 404, "Column not found");

  const { role, isOwner } = await getBoardRole(userId, column.boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can delete");

  await prisma.column.delete({ where: { id: columnId } }); // task จะ cascade ตาม schema
  res.json({ message: "Column deleted" });
};

// PATCH /boards/:boardId/columns/reorder
// Body: { order: [columnId1, columnId2, ...] }  -> position = index+1
exports.reorderColumns = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);
  const { order } = req.body;

  assert(Array.isArray(order) && order.length > 0, 400, "Order array required");

  const { role, isOwner } = await getBoardRole(userId, boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can reorder");

  // ตรวจว่าทุกคอลัมน์อยู่ในบอร์ดนี้จริง
  const cols = await prisma.column.findMany({ where: { id: { in: order } } });
  const allInBoard = cols.every(c => c.boardId === boardId);
  assert(allInBoard && cols.length === order.length, 400, "Invalid columns");

  await prisma.$transaction(
    order.map((id, idx) =>
      prisma.column.update({
        where: { id: Number(id) },
        data: { position: idx + 1 },
      })
    )
  );

  res.json({ message: "Columns reordered" });
};
