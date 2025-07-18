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
    const activeStaff = await Staff.countDocuments({ status: "active" });
    const onLeaveStaff = await Staff.countDocuments({ status: "on_leave" });

    // Get unique departments count
    const departments = await Staff.distinct("department");
    const departmentCount = departments.length;

    res.json({
      totalStaff,
      activeStaff,
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
