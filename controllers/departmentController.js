
import Department from '../models/Department.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
export const createDepartment = async (req, res) => {
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

export const deleteDepartment = async (req, res) => {
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

export const updateDepartment = async (req, res) => {
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
export const getDepartmentById = async (req, res) => {
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
        select: 'name _id owner',
        populate: {
          path: 'owner',
          select: '_id'
        }
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
          name: department.organization.name,
          owner: {
            id: department.organization.owner._id
          }
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const addEmployee = async (req, res) => {
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

export const assignHead = async (req, res) => {
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



export const removeEmployee = async (req, res) => {
  try {
    const { departmentId, employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId) || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid department or employee ID' });
    }

    const department = await Department.findById(departmentId).populate('organization');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!department.employees.includes(employeeId)) {
      return res.status(400).json({ message: 'Employee is not in this department' });
    }

    department.employees = department.employees.filter(id => id.toString() !== employeeId);
    await department.save();

    const orgId = department.organization._id;
    employee.employeeRoles = employee.employeeRoles
      .map(role => {
        if (role.organization.toString() === orgId.toString()) {
          role.departments = role.departments.filter(depId => depId.toString() !== departmentId);
        }
        return role;
      })
      .filter(role => role.departments.length > 0 || role.organization.toString() !== orgId.toString());

    await employee.save();

    res.status(200).json({
      message: 'Employee removed from department successfully',
      department: {
        id: department._id,
        name: department.name,
        employees: department.employees,
      },
    });
  } catch (error) {
    console.error('Error in removeEmployee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const removeHead = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const department = await Department.findById(departmentId).populate('organization');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!department.head) {
      return res.status(400).json({ message: 'No head assigned to this department' });
    }

    const head = await User.findById(department.head);
    if (!head) {
      return res.status(404).json({ message: 'Head user not found' });
    }

    head.headedDepartments = head.headedDepartments.filter(depId => depId.toString() !== departmentId);

    if (!department.employees.includes(head._id)) {
      department.employees.push(head._id);
    }

    const orgId = department.organization._id;
    let orgRole = head.employeeRoles.find(role => role.organization.toString() === orgId.toString());
    if (orgRole) {
      if (!orgRole.departments.includes(departmentId)) {
        orgRole.departments.push(departmentId);
      }
    } else {
      head.employeeRoles.push({
        organization: orgId,
        departments: [departmentId],
      });
    }

    department.head = null;

    await Promise.all([department.save(), head.save()]);

    res.status(200).json({
      message: 'Head removed and added as employee successfully',
      department: {
        id: department._id,
        name: department.name,
        head: department.head,
        employees: department.employees,
      },
    });
  } catch (error) {
    console.error('Error in removeHead:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

