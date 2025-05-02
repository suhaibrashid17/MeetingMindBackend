import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Department from '../models/Department.js';

export const getOwnedOrganizations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const organizations = await Organization.find({ owner: userId });
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching owned organizations", error });
  }
};

export const getHeadedDepartments = async (req, res) => {
  try {
    const userId = req.query.userId;

    const departments = await Department.find({ head: userId }).populate('organization', 'name');

    const organizations = [
      ...new Map(
        departments.map(dept => [dept.organization._id.toString(), dept.organization])
      ).values()
    ];

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organizations from headed departments", error });
  }
};

export const getEmployeeRoles = async (req, res) => {
  try {
    const userId = req.query.userId;

    const user = await User.findById(userId).populate({
      path: 'employeeRoles.organization',
      select: 'name'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const organizations = [
      ...new Map(
        user.employeeRoles.map(role => [role.organization._id.toString(), role.organization])
      ).values()
    ];

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organizations from employee roles", error });
  }
};