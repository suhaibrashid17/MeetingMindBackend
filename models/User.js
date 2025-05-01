const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique:true },
  email: { type: String, required: true, unique: true },
  password: {type: String,  required: true,},
  ownedOrganizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
  headedDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  employeeRoles: [
    {
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
      departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("User", UserSchema);
