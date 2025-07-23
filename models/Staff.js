const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    position: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: [
        "Administration",
        "Finance",
        "Académique",
        "Ressources Humaines",
        "Maintenance",
      ],
    },
    hireDate: { type: Date, required: true },
    salary: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["actif", "inactif", "en_conge"],
      default: "actif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
