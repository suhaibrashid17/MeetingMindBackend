const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    head: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  });
  UserSchema.index({ email: 1 });

  module.exports = mongoose.model("Department", DepartmentSchema)