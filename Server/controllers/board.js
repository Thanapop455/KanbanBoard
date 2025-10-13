const prisma = require("../config/prisma");
const crypto = require("crypto");


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

function assert(condition, status, message) {
  if (!condition) {
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

// ---------- Controllers ----------

// GET /boards  -> บอร์ดที่เป็นเจ้าของหรือเป็นสมาชิก
exports.listBoards = async (req, res) => {
  const userId = req.user.id;
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { members: true, columns: true, tasks: true } },
      owner: { select: { id: true, email: true, name: true } },
    },
  });
  res.json({ boards });
};

// POST /boards  -> สร้างบอร์ด
exports.createBoard = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;
  assert(name?.trim(), 400, "Name is required");

  const board = await prisma.board.create({
    data: {
      name: name.trim(),
      ownerId: userId,
      // เก็บเจ้าของเป็นสมาชิกด้วย (Owner)
      members: {
        create: { userId, role: "OWNER" },
      },
      // สร้างคอลัมน์เริ่มต้น (ถ้าอยากได้)
      columns: {
        create: [
          { name: "To Do", position: 1 },
          { name: "In Progress", position: 2 },
          { name: "Done", position: 3 },
        ],
      },
    },
  });
  res.status(201).json({ board });
};

// GET /boards/:id  -> รายละเอียดบอร์ด
exports.getBoard = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);

  const { isMember, board } = await getBoardRole(userId, boardId);
  assert(isMember, 403, "No permission to view this board");

  const detail = await prisma.board.findUnique({
    where: { id: board.id },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { addedAt: "asc" },
      },
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignees: {
                include: { user: { select: { id: true, email: true, name: true } } },
              },
              tags: { include: { tag: true } },
              subtasks: { orderBy: { position: "asc" } },
            },
          },
        },
      },
      tags: true,
    },
  });

  res.json({ board: detail });
};

// PUT /boards/:id  -> เปลี่ยนชื่อบอร์ด
exports.renameBoard = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);
  const { name } = req.body;
  assert(name?.trim(), 400, "Name is required");

  const { role, isOwner } = await getBoardRole(userId, boardId);
  assert(role, 403, "No permission");
  // อนุญาต OWNER หรือ ADMIN
  assert(isOwner || role === "ADMIN", 403, "Only owner/admin can rename");

  const board = await prisma.board.update({
    where: { id: boardId },
    data: { name: name.trim() },
  });
  res.json({ board });
};

// DELETE /boards/:id  -> ลบบอร์ด (เจ้าของเท่านั้น)
exports.deleteBoard = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);

  const { isOwner } = await getBoardRole(userId, boardId);
  assert(isOwner, 403, "Only owner can delete board");

  await prisma.board.delete({ where: { id: boardId } });
  res.json({ message: "Board deleted" });
};

// GET /boards/:id/members  -> รายชื่อสมาชิก
exports.listMembers = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);

  const { isMember } = await getBoardRole(userId, boardId);
  assert(isMember, 403, "No permission");

  const members = await prisma.boardMember.findMany({
    where: { boardId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { addedAt: "asc" },
  });
  res.json({ members });
};

// PATCH /boards/:id/members/:userId/role  -> เปลี่ยน role (owner เท่านั้น)
exports.updateMemberRole = async (req, res) => {
  const actorId = req.user.id;
  const boardId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);
  const { role } = req.body; // "ADMIN" | "MEMBER"

  const { isOwner } = await getBoardRole(actorId, boardId);
  assert(isOwner, 403, "Only owner can change roles");

  // กันไม่ให้ยุ่งกับ owner
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  assert(board.ownerId !== targetUserId, 400, "Cannot change owner's role");

  const updated = await prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId: targetUserId } },
    data: { role },
  });
  res.json({ member: updated });
};

// DELETE /boards/:id/members/:userId  -> ลบสมาชิก (owner/admin ลบ member ได้, owner ลบ admin ได้)
exports.removeMember = async (req, res) => {
  const actorId = req.user.id;
  const boardId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);

  const { role: actorRole, isOwner } = await getBoardRole(actorId, boardId);
  assert(actorRole, 403, "No permission");

  const target = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: targetUserId } },
  });
  assert(target, 404, "Member not found");

  // กฎสิทธิ์
  if (!isOwner) {
    // admin ห้ามลบ admin/owner
    assert(target.role === "MEMBER", 403, "Admin can remove only MEMBER");
  } else {
    // owner ห้ามลบตัวเองผ่าน endpoint นี้
    assert(targetUserId !== actorId, 400, "Owner cannot remove self here");
  }

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId: targetUserId } },
  });

  res.json({ message: "Member removed" });
};

exports.transferOwnership = async (req, res) => {
  const actorId = req.user.id;
  const boardId = Number(req.params.id);
  const { userId: targetUserId } = req.body;

  const { isOwner } = await getBoardRole(actorId, boardId);
  assert(isOwner, 403, "Only owner can transfer ownership");
  assert(actorId !== Number(targetUserId), 400, "Cannot transfer to yourself");

  const target = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: Number(targetUserId) } },
  });
  assert(target, 404, "Target user is not a member");

  await prisma.$transaction([
    prisma.board.update({ where: { id: boardId }, data: { ownerId: Number(targetUserId) } }),
    prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId: Number(targetUserId) } },
      data: { role: "OWNER" },
    }),
    prisma.boardMember.update({
      where: { boardId_userId: { boardId, userId: actorId } },
      data: { role: "ADMIN" },
    }),
  ]);

  res.json({ message: "Ownership transferred" });
};

exports.leaveBoard = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  assert(board, 404, "Board not found");
  assert(board.ownerId !== userId, 400, "Owner cannot leave; transfer ownership first");

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId } },
  });

  res.json({ message: "Left board" });
};

// ---------- Invite Flow ----------

// POST /boards/:id/invite  -> ออก invite token (owner/admin)
exports.createInvite = async (req, res) => {
  const userId = req.user.id;
  const boardId = Number(req.params.id);
  const { email, role = "MEMBER", expiresInHours = 48 } = req.body;

  const { role: actorRole } = await getBoardRole(userId, boardId);
  assert(actorRole, 403, "No permission");
  assert(actorRole === "OWNER" || actorRole === "ADMIN", 403, "Only owner/admin can invite");
  assert(email, 400, "Email is required");

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: { boardId, email, token, role, expiresAt },
  });

  // ส่งคืน token (ในโปรดักชันจะส่งอีเมล; ที่นี่ส่ง token ให้ front นำไปแสดงลิงก์)
  res.status(201).json({ invite });
};

// POST /invites/:token/accept  -> ผู้รับคำเชิญยืนยันเข้าบอร์ด
exports.acceptInvite = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.params;

  const invite = await prisma.invite.findUnique({ where: { token } });
  assert(invite, 404, "Invite not found");
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await prisma.invite.delete({ where: { id: invite.id } });
    assert(false, 400, "Invite expired");
  }

  // ถ้าเป็นสมาชิกอยู่แล้ว ข้ามได้
  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: invite.boardId, userId } },
  });
  if (!existing) {
    await prisma.boardMember.create({
      data: {
        boardId: invite.boardId,
        userId,
        role: invite.role,
      },
    });
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { acceptedById: userId },
  });

  res.json({ message: "Joined board", boardId: invite.boardId });
};
