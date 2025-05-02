import express from 'express'
const router = express.Router()
import {getEmployeeRoles, getHeadedDepartments, getOwnedOrganizations} from "../controllers/userController"
router.get('/getownedorganizations', getOwnedOrganizations);
router.get('/getheadeddepartments', getHeadedDepartments);
router.get('/getemployeeroles', getEmployeeRoles);

export default router;