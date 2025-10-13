const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasksInColumn,
  assignUser,
  unassignUser,
  listAssignees,
} = require("../controllers/task");

router.use(authCheck);


router.post("/columns/:columnId/tasks", createTask);

router.get("/boards/:boardId/tasks", listTasks);

router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

router.patch("/tasks/:id/move", moveTask);
router.patch("/columns/:columnId/tasks/reorder", reorderTasksInColumn);

router.get("/tasks/:id/assignees", listAssignees);
router.post("/tasks/:id/assignees", assignUser);
router.delete("/tasks/:id/assignees/:userId", unassignUser);

module.exports = router;
