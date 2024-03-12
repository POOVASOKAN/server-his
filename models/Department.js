import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
});

export default mongoose.model("HisDepartments", departmentSchema);
