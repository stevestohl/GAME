import Employee from '../models/Employee.js'

// ------------------ GET ALL ------------------
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({})
        res.status(200).json({ employees, count: employees.length })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// -- GET ONE ------------------
export const getEmployee = async (req, res) => {
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


// ------------------ CREATE ------------------]
export const createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body)
        res.status(201).json({ employee })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}


// ------------------ UPDATE ------------------
export const updateEmployee = async (req, res) => {
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


// ------------------ DELETE ------------------=
export const deleteEmployee = async (req, res) => {
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