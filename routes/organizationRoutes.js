import express from 'express'
const router = express.Router();
import {createOrganization, deleteOrganization, updateOrganization, getOrganizationById, getDepartmentsByOrgId} from '../controllers/organizationController.js'
router.post('/organization', createOrganization);
router.get('/organization/:id', getOrganizationById)
router.delete('/organization/:orgId', deleteOrganization);
router.put('/organization/:orgId', updateOrganization);
router.get('/getdeptsbyorgid/:orgId', getDepartmentsByOrgId);
export default router;