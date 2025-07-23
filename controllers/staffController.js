const fs = require("fs");
const xlsx = require("xlsx");
const Staff = require("../models/Staff");

// GET ALL STAFF MEMBERS
exports.getAllStaff = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const staff = await Staff.find(query).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET STAFF STATISTICS
exports.getStaffStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ status: "actif" });
    const inactiveStaff = await Staff.countDocuments({ status: "inactif" });
    const onLeaveStaff = await Staff.countDocuments({ status: "en_conge" });

    // Get unique departments count
    const departments = await Staff.distinct("department");
    const departmentCount = departments.length;

    res.json({
      totalStaff,
      activeStaff,
      inactiveStaff,
      onLeaveStaff,
      departmentCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE A NEW STAFF MEMBER
exports.createStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE A STAFF MEMBER
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(id, req.body, { new: true });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET A STAFF MEMBER BY ID
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE A STAFF MEMBER
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllStaff = async (req, res) => {
  try {
    await Staff.deleteMany({});
    res.json({ message: "All staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export to Excel
exports.exportStaffToExcel = async (req, res) => {
  try {
    const staff = await Staff.find().lean();

    // Convert to Excel format
    const ws = xlsx.utils.json_to_sheet(staff);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Staff");

    // Generate file
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    // Send file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=staff_export.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import from Excel
exports.importStaffFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validate and format data
    const staffToAdd = data.map(item => ({
      name: item["Name"] || item["name"],
      email: item["Email"] || item["email"],
      phone: item["Phone"] || item["phone"],
      position: item["Position"] || item["position"],
      department: item["Department"] || item["department"] || "Administration",
      hireDate: item["Hire Date"] ? new Date(item["Hire Date"]) : new Date(),
      salary: Number(item["Salary"] || item["salary"] || 0),
      status: item["Status"] || item["status"] || "active",
    }));

    // Insert to database
    const result = await Staff.insertMany(staffToAdd);
    fs.unlinkSync(req.file.path); // Delete temp file

    res.json({
      message: `${result.length} staff members imported successfully`,
      importedCount: result.length,
    });
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};
