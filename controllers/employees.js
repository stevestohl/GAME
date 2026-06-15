import Employee from '../models/Employee.js'
import Drink from '../models/Drinks.js'

// ------------------ GET ALL ------------------

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({})
        res.status(200).json({ employees, count: employees.length })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

const getAllDrinks = async (req, res) => {
    try {
        const drinks = await Drink.find({})
        res.status(200).json({ drinks, count: drinks.length })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ GET ONE ------------------

const getEmployee = async (req, res) => {
    try {
        const { id: employeeId } = req.params
        const employee = await Employee.findById(employeeId)

        if (!employee) {
            return res.status(404).json({ msg: `No employee with ID ${employeeId} found.` })
        }

        res.status(200).json({ employee })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

const getDrink = async (req, res) => {
    try {
        const { id: drinkID } = req.params
        const drink = await Drink.findById(drinkID)

        if (!drink) {
            return res.status(404).json({ msg: `No drink with ID ${drinkID} found.` })
        }

        res.status(200).json({ drink })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ CREATE ------------------

const createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body)
        res.status(201).json({ employee })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

const createDrink = async (req, res) => {
    try {
        const drink = await Drink.create(req.body)   // FIXED: missing await
        res.status(201).json({ drink })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ UPDATE ------------------

const updateEmployee = async (req, res) => {
    try {
        const { id: employeeId } = req.params
        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            req.body,
            { new: true, runValidators: true }
        )

        if (!employee) {
            return res.status(404).json({ msg: `No employee with ID ${employeeId} found.` })
        }

        res.status(200).json({ employee })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

const updateDrink = async (req, res) => {
    try {
        const { id: drinkID } = req.params
        const drink = await Drink.findByIdAndUpdate(
            drinkID,
            req.body,
            { new: true, runValidators: true }
        )

        if (!drink) {
            return res.status(404).json({ msg: `No drink with ID ${drinkID} found.` })
        }

        res.status(200).json({ drink })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ DELETE ------------------

const deleteEmployee = async (req, res) => {
    try {
        const { id: employeeId } = req.params
        const employee = await Employee.findByIdAndDelete(employeeId)

        if (!employee) {
            return res.status(404).json({ msg: `No employee with ID ${employeeId} found.` })
        }

        res.status(200).json({ msg: 'Employee successfully deleted' })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

const deleteDrink = async (req, res) => {
    try {
        const { id: drinkID } = req.params
        const drink = await Drink.findByIdAndDelete(drinkID)

        if (!drink) {
            return res.status(404).json({ msg: `No drink with ID ${drinkID} found.` })
        }

        res.status(200).json({ msg: 'Drink successfully deleted' })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

export {
    getAllEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllDrinks,
    getDrink,
    updateDrink,
    createDrink,
    deleteDrink
}
