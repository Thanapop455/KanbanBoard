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

// ---------- controllers ----------

// GET /boards/:boardId/tags  -> list tags ในบอร์ด
exports.listTags = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);

  const { isMember } = await getBoardRole(userId, boardId);
  assert(isMember, 403, "No permission");

  const tags = await prisma.tag.findMany({
    where: { boardId },
    orderBy: [{ name: "asc" }],
  });
  res.json({ tags });
};

// POST /boards/:boardId/tags  -> สร้าง tag (owner/admin)
exports.createTag = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.boardId);
  const { name, color } = req.body || {};

  assert(name?.trim(), 400, "Name is required");

  const { role, isOwner } = await getBoardRole(userId, boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can create tags");

  try {
    const tag = await prisma.tag.create({
      data: { boardId, name: name.trim(), color: color ?? null },
    });
    res.status(201).json({ tag });
  } catch (err) {
    // unique constraint: @@unique([boardId, name])
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Tag name already exists in this board" });
    }
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /tags/:id  -> แก้ไขชื่อ/สี tag (owner/admin)
exports.updateTag = async (req, res) => {
  const userId = req.user.id;
  const tagId = Number(req.params.id);
  const { name, color } = req.body || {};

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  assert(tag, 404, "Tag not found");

  const { role, isOwner } = await getBoardRole(userId, tag.boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can update tags");
  if (name !== undefined) assert(name?.trim(), 400, "Invalid name");

  try {
    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(color !== undefined ? { color: color ?? null } : {}),
      },
    });
    res.json({ tag: updated });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Tag name already exists in this board" });
    }
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /tags/:id  -> ลบ tag (owner/admin)
exports.deleteTag = async (req, res) => {
  const userId = req.user.id;
  const tagId = Number(req.params.id);

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  assert(tag, 404, "Tag not found");

  const { role, isOwner } = await getBoardRole(userId, tag.boardId);
  assert(role, 403, "No permission");
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can delete tags");

  // TaskTag จะถูกลบตาม FK onDelete: Cascade ใน schema
  await prisma.tag.delete({ where: { id: tagId } });
  res.json({ message: "Tag deleted" });
};

// POST /tasks/:taskId/tags  -> ผูก tag กับ task (สมาชิกก็ทำได้)
exports.attachTagToTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const { tagId } = req.body || {};
  assert(tagId, 400, "tagId is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const tag = await prisma.tag.findUnique({ where: { id: Number(tagId) } });
  assert(tag, 404, "Tag not found");

  // ต้องเป็นบอร์ดเดียวกัน
  assert(task.boardId === tag.boardId, 400, "Tag and Task must belong to the same board");

  // ผู้ยิงต้องเป็นสมาชิกบอร์ด
  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  try {
    await prisma.taskTag.create({
      data: { taskId, tagId: Number(tagId) },
    });
  } catch (err) {
    if (err.code === "P2002") {
      // composite PK @@id([taskId, tagId]) → ซ้ำแล้ว
      return res.status(200).json({ message: "Already attached" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }

  res.status(201).json({ message: "Tag attached" });
};

// DELETE /tasks/:taskId/tags/:tagId  -> ถอด tag ออกจาก task
exports.detachTagFromTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = Number(req.params.taskId);
  const tagId = Number(req.params.tagId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert(task, 404, "Task not found");

  const { isMember } = await getBoardRole(userId, task.boardId);
  assert(isMember, 403, "No permission");

  await prisma.taskTag.delete({
    where: { taskId_tagId: { taskId, tagId } },
  });

  res.json({ message: "Tag detached" });
};
