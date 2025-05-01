const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');

const getOwnedOrganizations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const organizations = await Organization.find({ owner: userId });
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching owned organizations", error });
  }
};

const getHeadedDepartments = async (req, res) => {
  try {
    const userId = req.query.userId;

    const departments = await Department.find({ head: userId }).populate('organization', 'name');

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching headed departments", error });
  }
};

const getEmployeeRoles = async (req, res) => {
  try {
    const userId = req.query.userId;

    const user = await User.findById(userId).populate({
      path: 'employeeRoles.organization',
      select: 'name'
    }).populate({
      path: 'employeeRoles.departments',
      select: 'name'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.employeeRoles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee roles", error });
  }
};

module.exports = {getEmployeeRoles, getHeadedDepartments, getOwnedOrganizations}
