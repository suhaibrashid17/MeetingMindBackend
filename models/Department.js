import mongoose from "mongoose"
const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  });

export default mongoose.model("Department", DepartmentSchema)