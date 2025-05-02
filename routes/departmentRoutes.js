import express from 'express';
import { createDepartment, deleteDepartment, updateDepartment, getDepartmentById, addEmployee, assignHead, removeEmployee, removeHead } from '../controllers/departmentController.js';

const router = express.Router();

router.post('/department', createDepartment);
router.get('/department/:id', getDepartmentById);
router.delete('/department/:deptId', deleteDepartment);
router.put('/department/:deptId', updateDepartment);
router.post('/addemployee/:id', addEmployee);
router.post('/assignadmin/:id', assignHead);
router.delete('/departments/:departmentId/employees/:employeeId', removeEmployee);
router.delete('/removehead/:departmentId', removeHead);

export default router;