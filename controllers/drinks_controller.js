import Drink from '../models/Drinks.js'

// ------------------ GET ALL ------------------

export const getAllDrinks = async (req, res) => {
    try {
        const drinks = await Drink.find({})
        res.status(200).json({ drinks, count: drinks.length })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}
// ------------------ GET ONE ------------------

export const getDrink = async (req, res) => {
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

export const createDrink = async (req, res) => {
    try {
        const drink = await Drink.create(req.body)   // FIXED: missing await
        res.status(201).json({ 
            msg : "Drink added successfully!",
            drink })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ UPDATE ------------------

export const updateDrink = async (req, res) => {
    try {
        const { id: drinkID } = req.params

        const drink = await Drink.findById(drinkID)

        if (!drink) {
            return res.status(404).json({ msg: `No drink with ID ${drinkID} found.` })
        }

        if(drink.isDefault === true) {
            return res.status(403).json({ msg: 'You cannont udpate default drink cards'})
        }

        const updatedDrink = await Drink.findByIdAndUpdate(
            drinkID,
            req.body,
            { new: true, runValidators: true }
        )

        res.status(200).json({
            msg: "Drink updated successfully!",
            drink 
        })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}

// ------------------ DELETE ------------------

export const deleteDrink = async (req, res) => {
    try {
        const { id: drinkID } = req.params
        const drink = await Drink.findById(drinkID)

        if (!drink) {
            return res.status(404).json({ msg: `No drink with ID ${drinkID} found.` })
        }

        if (drink.isDefault === true) {
            return res.status(403).json({msg: "You cannot modify default drink cards."})
        }

        await Drink.findByIdAndDelete(drinkID)
        res.status(200).json({ msg: 'Drink successfully deleted' })

    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
}
