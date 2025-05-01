const User = require('../models/User');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');
const createOrganization = async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    console.log(name)
    console.log(ownerId)
    const newOrg = new Organization({
      name,
      owner: ownerId,
      departments: [],
    });

    const savedOrg = await newOrg.save();

    await User.findByIdAndUpdate(ownerId, { $push: { ownedOrganizations: savedOrg._id } });

    res.status(201).json(savedOrg);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating organization", error });
  }
};


const deleteOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const deletedOrg = await Organization.findByIdAndDelete(orgId);
    if (!deletedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    await User.updateMany(
      { ownedOrganizations: orgId },
      { $pull: { ownedOrganizations: orgId } }
    );

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error deleting organization", error });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name } = req.body;

    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      { name },
      { new: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: "Error updating organization", error });
  }
};
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid organization ID' });
    }

    const organization = await Organization.findById(id)
      .populate({
        path: 'owner',
        select: 'username email createdAt'
      })
      .populate({
        path: 'departments',
        populate: [
          {
            path: 'head',
            select: 'username email' 
          },
          {
            path: 'employees',
            select: 'username email'
          }
        ]
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({
      message: 'Organization retrieved successfully',
      data: organization
    });

  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error while fetching organization' });
  }
};

const getDepartmentsByOrgId = async (req, res) => {
  try {
    const { orgId } = req.params;
    const departments = await Department.find({ organization: orgId }).select('name');
    const departmentNames = departments.map(dept => dept.name);
    res.status(200).json(departmentNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};





module.exports = {createOrganization, deleteOrganization, updateOrganization, getOrganizationById, getDepartmentsByOrgId}
