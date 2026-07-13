import express from 'express'
import { getAllTrivia, getTriviaBackendStatus, getTriviaByID } from '../controllers/trivia_controller.js'
import {getAllEmployees, getEmployee, createEmployee, 
    updateEmployee, deleteEmployee } from '../controllers/employees_controller.js'
import { getAllPrompt2Cards } from '../controllers/prompt2_controller.js'

import {getAllDrinks, 
    getDrink, updateDrink, deleteDrink, createDrink} from '../controllers/drinks_controller.js'


const router = express.Router()

router.route('/employees')
    .get(getAllEmployees)
    .post(createEmployee)

router.route('/prompt2')
    .get(getAllPrompt2Cards)

router.route('/employees/:id')
    .get(getEmployee)
    .patch(updateEmployee)
    .delete(deleteEmployee)

router.route('/drinks')
    .get(getAllDrinks)
    .post(createDrink)

router.route('/drinks/:id')
    .get(getDrink)
    .patch(updateDrink)
    .delete(deleteDrink)

//Temple-Trivia Routes
router.route('/templetrivia')
    .get(getAllTrivia)
    
router.route('/templetrivia/status')
    .get(getTriviaBackendStatus)

router.route('/templetrivia/:id')
    .get(getTriviaByID)

export default router