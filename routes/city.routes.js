// The user model
const City = require("../models/City.model")

// ℹ️ The main router for the app.
const router = require("express").Router()

router.get('/', async (req, res, next) => {
    try {
        const cities = await City.find({
            city: { $regex: req.query.search, $options: "i" }
        })
        res.status(200).json(cities)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.get('/:cityId', async (req, res, next) => {
    try {
        const city = await City.findById(req.params.cityId)
        res.status(200).json(city)
    } catch (error) {
        console.log(error)
        next(error)
    }
});

module.exports = router