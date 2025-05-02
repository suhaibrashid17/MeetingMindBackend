import mongoose from "mongoose"

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    createdAt: { type: Date, default: Date.now },
  });
export default mongoose.model("Organization", OrganizationSchema);
  