const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  listBoards,
  createBoard,
  getBoard,
  renameBoard,
  deleteBoard,
  listMembers,
  updateMemberRole,
  removeMember,
  transferOwnership,
  leaveBoard, 
  createInvite,
  acceptInvite,
} = require("../controllers/board");

router.use(authCheck);

router.get("/boards", listBoards);
router.post("/boards", createBoard);
router.get("/boards/:id", getBoard);
router.put("/boards/:id", renameBoard);
router.delete("/boards/:id", deleteBoard);

router.get("/boards/:id/members", listMembers);
router.patch("/boards/:id/members/:userId/role", updateMemberRole);
router.delete("/boards/:id/members/:userId", removeMember);

router.post("/boards/:id/transfer-ownership", transferOwnership);
router.post("/boards/:id/leave", leaveBoard);

router.post("/boards/:id/invite", createInvite);
router.post("/invites/:token/accept", acceptInvite);

module.exports = router;
