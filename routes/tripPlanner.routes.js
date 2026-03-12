const City = require("../models/City.model")
const TripPlanner = require("../models/TipPlanner.model")

const router = require("express").Router()

const OpenAI = require("openai")

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

router.post("/AI-generated-content", async (req, res, next) => {
    console.log(req.body)
    try {
        const cities = await City
            .find( { _id: { $in: req.body.cities } })
            .select("city")
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
                        You area professional trip planner.
                        Generate only details of a trip.
                        Return a JSON object with: itenaries - an array itenary object which has a 
                        day (the number of day of the trip), date(the date of the particular day),
                        city (the name of the city), an array of activities. Each activity has a title(String),
                        description(String), type(String (Sightseeing, Food etc)), location (String), estimatedCost (String).
                        The JSON object should be ready to be parsed using JSON parse.
                        If a valid trip cannot be generated with the entered details
                        from user, then return an error with status code 400 in JSON format of {errorMessage: (reason)}.
                        Also the same if input from user is not present`
                },
                {
                    role: "user",
                    content: `Create an itenary for a trip to theses cities: ${cities} for
                              ${req.body.numberOfDays} days. The trip should start on ${req.body.startDate}.
                              The user has the following preferences: ${req.body.preferences}. So please try to match these preferences while planning the trip. `
                }
            ]
        })
    const JSONresponse = JSON.parse(response.choices[0].message.content)
    res.json(JSONresponse)
    } catch (error) {
        next(error)
    }
})

module.exports = router