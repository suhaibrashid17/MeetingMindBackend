const express = require('express');
const router = express.Router();
const {createDepartment, deleteDepartment, updateDepartment, getDepartmentById, addEmployee, assignHead, removeEmployee, removeHead} = require('../controllers/departmentController');

router.post('/department', createDepartment);
router.get('/department/:id', getDepartmentById);
router.delete('/department/:deptId', deleteDepartment);
router.put('/department/:deptId', updateDepartment);
router.post('/addemployee/:id', addEmployee);
router.post('/assignadmin/:id', assignHead);
router.delete('/departments/:departmentId/employees/:employeeId', removeEmployee);
router.delete('/removehead/:departmentId', removeHead);
module.exports = router;