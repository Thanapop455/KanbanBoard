const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  listSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
} = require("../controllers/subtask");

router.use(authCheck);

router.get("/tasks/:taskId/subtasks", listSubtasks);
router.post("/tasks/:taskId/subtasks", createSubtask);

router.put("/subtasks/:id", updateSubtask);
router.delete("/subtasks/:id", deleteSubtask);

router.patch("/tasks/:taskId/subtasks/reorder", reorderSubtasks);

module.exports = router;
