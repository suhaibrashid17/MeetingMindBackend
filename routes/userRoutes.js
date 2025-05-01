const express = require('express')
const router = express.Router()
const {getEmployeeRoles, getHeadedDepartments, getOwnedOrganizations} = require('../controllers/userController')
router.get('/getownedorganizations', getOwnedOrganizations);
router.get('/getheadeddepartments', getHeadedDepartments);
router.get('/getemployeeroles', getEmployeeRoles);

module.exports = router;