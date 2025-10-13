const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  listColumns,
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} = require("../controllers/column");

router.use(authCheck);

router.get("/boards/:boardId/columns", listColumns);
router.post("/boards/:boardId/columns", createColumn);

router.put("/columns/:id", renameColumn);
router.delete("/columns/:id", deleteColumn);

router.patch("/boards/:boardId/columns/reorder", reorderColumns);

module.exports = router;
