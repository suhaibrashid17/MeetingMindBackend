const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    createdAt: { type: Date, default: Date.now },
  });
  OrganizationSchema.index({ owner: 1 });

  module.exports = mongoose.model("Organization", OrganizationSchema);
  