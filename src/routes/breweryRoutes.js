const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const jwt = require('jsonwebtoken')
const flat = require('flat')


const router = express.Router()

const loginErrorMessage = "You must be logged in to create a new brewery location."

router.post('/createBrewery', async(req, res) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    if (!authorization) {
        console.log("No authorization token provided for creating brewery location.")
        return res.status(401).send({error: loginErrorMessage})
    }

    const {name, address, price, phoneNumber, email, website, businessHours, alternativeKidFriendlyHours, accommodations} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload

        const user = User.findById({userId})
        if (!user)
            res.status(401).send({error: "No user exists with this id. Please ensure you provide a valid authorization token."})

        try {
            const brewery = new Brewery({name, address, price, phoneNumber, email, website, businessHours, alternativeKidFriendlyHours, accommodations, creator: userId})
            
            await brewery.save()

            res.send({response: "New brewery location with the name " + name + " was successfully created!"})
        } catch(err) {
            return res.status(422).send({error: err.message})
        }
    })
})

router.post('/updateBrewery', async(req, res) => {
    const {authorization} = req.headers

    if (!authorization) {
        console.log("No authorization token provided to update a brewery location.")
        return res.status(401).send({error: loginErrorMessage})
    }

    // need to include all possible update-able portions of a location
    const {} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async(err, payload) => {
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        const brewery = Brewery.findOne({creator: userId}, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find any breweries associated with this user."})
            }

            // check all elements for empty so we can reassign changed ones


            try {
                doc._doc = {...doc._doc}
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })
    })
})

router.get('/search', async(req, res) => {
    // all the search criteria to filter on
    const {latitude, longitude, zipCode, distance, price, accommodationsSearch, dayAndTime} = req.body

    if ((!latitude || !longitude) && !zipCode) {
        return res.status(400).send({error: "Must provide a location to search in."})
    }

    var dollarSigns = []
    if (price === "$") {
        dollarSigns = ["$"]
    } else if (price === "$$") {
        dollarSigns = ["$", "$$"]
    } else if (price === "$$$") {
        dollarSigns = ["$", "$$", "$$$"]
    } else if (price === "$$$$" || price === null) {
        dollarSigns = ["$", "$$", "$$$", "$$$$"]
    } else {
        return res.status(401).send({error: "Invalid maximum price limiter."})
    }

    // parse filter critera into a MongoDB search 
    const searchQuery = {
        price: {
            $in: dollarSigns
        }
    }

    if (accommodationsSearch !== null) {
        var temp = {"accommodations": accommodationsSearch}
        flattenedAccommodations = flat(temp)
        for (var accommodation in flattenedAccommodations) {
            accommodationName = accommodation
            accommodationValue = flattenedAccommodations[accommodationName]
            searchQuery[accommodationName] = accommodationValue
        }
    }
    if (dayAndTime !== null) {
        var temp = {"businessHours": dayAndTime}
        flattenedTime = flat(temp)
        for (var time in flattenedTime) {
            timeName = time
            timeValue = flattenedTime[timeName]
            searchQuery[timeName] = timeValue
        }
    }
    console.log(searchQuery)
    
    const filter = {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [ longitude, latitude ]
                },
                $maxDistance: distance,
                spherical: true,
                distanceField: "distance",
                distanceMultiplier: 0.000621371,
                query: searchQuery
            }
    } 

    // find all documents that match the provided filter criteria
    var documents = await Brewery.aggregate([filter])
    if (!documents){
        return res.status(400).send({error: "Couldn't find any results for this search."})
    }

    var results = []
    documents.forEach(function(element) {
        results.push(
            {
                breweryId: element._id,
                name: element.name,
                address: element.address,
                price: element.price,
                accommodations: element.accommodations,
                distance: element.distance
            }
        )
    })
    // return only certain information necessary for displaying
    // an individual location on the list/map view
    //      need to be careful how much data we're trying to send
    //      back to the user as sending 2kb/document could lead to immense amounts
    //      of data being sent and very slow response times
    return res.status(200).send(results.sort(function(element) {
        return element.distance
    }))
})

router.get(`/brewery`, async(req, res) => {
    // get all of the information for a specific document in storage
    const {breweryId} = req.body

    const brewery = Brewery.findById(breweryId)
    if (!brewery) {
        return res.status(400).send({error: "Could not find the specified brewery location. Please try again."})
    }

    res.status(200).send(brewery)
})


module.exports = router