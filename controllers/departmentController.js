
const Department = require('../models/Department');
const Organization = require('../models/Organization');
const User = require('../models/User')
const mongoose = require('mongoose')
const createDepartment = async (req, res) => {
  try {
    const { name, organizationId } = req.body;
    console.log(name)
    console.log(organizationId)
    const department = new Department({
      name,
      organization: organizationId,
      employees: []
    });

    const savedDepartment = await department.save();

    await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { departments: savedDepartment._id } }
    );

    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;

    const deletedDepartment = await Department.findByIdAndDelete(deptId);
    if (!deletedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await Organization.updateMany(
      { departments: deptId },
      { $pull: { departments: deptId } }
    );

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { name, headId } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      deptId,
      { name, head: headId },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};
const getDepartmentById = async (req, res) => {
  try {
    const departmentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const department = await Department.findById(departmentId)
      .populate({
        path: 'head',
        select: 'username _id' 
      })
      .populate({
        path: 'employees',
        select: 'username _id' 
      })
      .populate({
        path: 'organization',
        select: 'name _id'
      })
      .select('name head employees organization'); 

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const response = {
      department: {
        id: department._id,
        name: department.name,
        head: department.head ? {
          id: department.head._id,
          name: department.head.username
        } : null,
        employees: department.employees.map(employee => ({
          id: employee._id,
          name: employee.username
        })),
        organization: {
          id: department.organization._id,
          name: department.organization.name
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addEmployee = async (req, res) => {
    try {
        const deptId = req.params.id;
        const { email } = req.body;
        const user = await User.findOne({"email": email});
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }
        
        const department = await Department.findById(deptId).populate('organization');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        if (department.organization.owner.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'Organization owner cannot be an employee' });
        }
        if (department.head && department.head.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'Department head cannot be an employee' });
        }

        const isEmployee = department.employees.some(empId => empId.toString() === user._id.toString());
        if (isEmployee) {
            return res.status(400).json({ message: 'User is already an employee in this department' });
        }

        department.employees.push(user._id);
        const employeeRole = user.employeeRoles.find(
            role => role.organization.toString() === department.organization._id.toString()
        );
        
        if (employeeRole) {
            if (!employeeRole.departments.includes(department._id)) {
                employeeRole.departments.push(department._id);
            }
        } else {
            user.employeeRoles.push({
                organization: department.organization._id,
                departments: [department._id]
            });
        }

        await user.save();
        await department.save();

        res.status(200).json({ message: 'User successfully added as employee', department });

    } catch (error) {
        res.status(500).json({ message: 'Error adding employee', error: error.message });
    }
};

const assignHead = async (req, res) => {
    try {
        const  deptId  = req.params.id;
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const department = await Department.findById(deptId).populate('organization');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        if (department.organization.owner.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'Organization owner cannot be department head' });
        }
        if (department.head && department.head.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'User is already the head of this department' });
        }
        department.employees = department.employees.filter(
            empId => empId.toString() !== user._id.toString()
        );
        const employeeRole = user.employeeRoles.find(
            role => role.organization.toString() === department.organization._id.toString()
        );
        
        if (employeeRole) {
            employeeRole.departments = employeeRole.departments.filter(
                deptId => deptId.toString() !== department._id.toString()
            );
            if (employeeRole.departments.length === 0) {
                user.employeeRoles = user.employeeRoles.filter(
                    role => role.organization.toString() !== department.organization._id.toString()
                );
            }
        }
        department.head = user._id;
        if (!user.headedDepartments.includes(department._id)) {
            user.headedDepartments.push(department._id);
        }

        await user.save();
        await department.save();

        res.status(200).json({ 
            message: 'User successfully assigned as department head',
            department 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error assigning head', error: error.message });
    }
};

module.exports = {createDepartment, deleteDepartment, updateDepartment, getDepartmentById, addEmployee, assignHead}