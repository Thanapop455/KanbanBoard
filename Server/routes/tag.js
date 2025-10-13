const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  attachTagToTask,
  detachTagFromTask,
} = require("../controllers/tag");

router.use(authCheck);

router.get("/boards/:boardId/tags", listTags);
router.post("/boards/:boardId/tags", createTag);

router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

router.post("/tasks/:taskId/tags", attachTagToTask);
router.delete("/tasks/:taskId/tags/:tagId", detachTagFromTask);

module.exports = router;
