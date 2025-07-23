const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const staffController = require("../controllers/staffController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", staffController.getAllStaff);
router.get("/stats", staffController.getStaffStats);
router.get("/:id", staffController.getStaffById);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/delete-all", staffController.deleteAllStaff);
router.delete("/:id", staffController.deleteStaff);

// Add these new routes
router.get("/export/excel", staffController.exportStaffToExcel);
router.post(
  "/import/excel",
  upload.single("file"),
  staffController.importStaffFromExcel
);

module.exports = router;
