const express = require('express');
const router = express.Router();
const {createOrganization, deleteOrganization, updateOrganization, getOrganizationById, getDepartmentsByOrgId} = require('../controllers/organizationController')
router.post('/organization', createOrganization);
router.get('/organization/:id', getOrganizationById)
router.delete('/organization/:orgId', deleteOrganization);
router.put('/organization/:orgId', updateOrganization);
router.get('/getdeptsbyorgid/:orgId', getDepartmentsByOrgId);

module.exports = router;