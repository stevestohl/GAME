import express from 'express'
import {getAllEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getAllDrinks, getDrink, updateDrink, deleteDrink} from '../controllers/employees.js'

const router = express.Router()

router.route('/api/employees')
    .get(getAllEmployees)
    .post(createEmployee)
router.route('/api/employees/:id')
    .get(getEmployee)
    .patch(updateEmployee)
    .delete(deleteEmployee)

router.route('/api/drinks')
    .get(getAllDrinks)

router.route('/api/drinks/:id')
    .get(getDrink)
    .patch(updateDrink)
    .delete(deleteDrink)

export default router