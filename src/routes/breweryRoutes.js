const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const jwt = require('jsonwebtoken')
const flat = require('flat')
const fuzzy = require('fuzzball')
const moment = require('moment')
const momentTz = require('moment-timezone')


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

    const {name, address, price, phoneNumber, email, website, businessHours, kidHoursSameAsNormal, alternativeKidFriendlyHours, accommodations} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload

        const user = await User.findById(userId)
        if (!user)
            res.status(401).send({error: "No user exists with this id. Please ensure you provide a valid authorization token."})

        try {
            var kidHours = {}
            if (kidHoursSameAsNormal) {
                kidHours = businessHours
            } else {
                kidHours = alternativeKidFriendlyHours
            }
            var brew = {name, address, price, phoneNumber, email, website, businessHours, alternativeKidFriendlyHours: kidHours, accommodations, creator: userId, ratings: 0.0}
            const brewery = new Brewery(brew)
            
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
    const {breweryId, newName, newAddress, newPrice, newPhoneNumber, newEmail, newWebsite, newOwner, newBusinessHours, newKidFriendlyHours, newAccommodations} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async(err, payload) => {
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        const brewery = await Brewery.findOne({_id: breweryId}, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find any breweries associated with this user."})
            }

            if (String(userId).trim() !== String(doc.creator).trim()) {
                return res.status(400).send({error: "This user is not authorized to update this location."})
            }

            // check all elements for empty so we can reassign changed ones
            try {
                doc._doc = {...doc._doc}

                if (newName) {
                    doc._doc = {...doc._doc, name: newName}
                    doc.markModified('name')
                }
                if (newAddress) {
                    doc._doc = {...doc._doc, address: newAddress}
                    doc.markModified('address')
                }
                if (newPrice) {
                    doc._doc = {...doc._doc, price: newPrice}
                    doc.markModified('price')
                }
                if (newPhoneNumber) {
                    doc._doc = {...doc._doc, phoneNumber: newPhoneNumber}
                    doc.markModified('phoneNumber')
                }
                if (newEmail) {
                    doc._doc = {...doc._doc, email: newEmail}
                    doc.markModified('email')
                }
                if (newWebsite) {
                    doc._doc = {...doc._doc, website: newWebsite}
                    doc.markModified('website')
                }
                if (newOwner) {
                    try {
                        var user = await User.findOne({email: newOwner})
                        if (!user) {
                            return res.status(400).send({error: "Couldn't find an account connected to the specified new owner's email."})
                        }
                        doc._doc = {...doc._doc, creator: user._id}
                        doc.markModified('creator')
                    } catch(err) {
                        return res.status(401).send({error: err})
                    }
                }
                if (newBusinessHours) {
                    newBusinessHours["openTimes"] = []
                    newBusinessHours["timeZone"] = ""
                    doc._doc = {...doc._doc, businessHours: newBusinessHours}
                    doc.markModified('businessHours')
                }
                if (newKidFriendlyHours) {
                    newKidFriendlyHours["openTimes"] = []
                    newKidFriendlyHours["timeZone"] = ""
                    doc._doc = {...doc._doc, alternativeKidFriendlyHours: newKidFriendlyHours}
                    doc.markModified('alternativeKidFriendlyHours')
                }
                if (newAccommodations) {
                    doc._doc = {...doc._doc, accommodations: newAccommodations}
                    doc.markModified('accommodations')
                }

                await doc.save()
                return res.status(200).send({count: 1, response: `Successfully updated the location ${doc.name}`})
            } catch (err) {
                return res.status(401).send({error: "Experienced an error while trying to update a brewery location."})
            }
        })
    })
})

router.get('/getOwnedBreweries', async(req, res) => {
    const {authorization} = req.headers

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        try {
            const {userId} = payload
            var breweries = await Brewery.find({creator: userId})

            if (!breweries) {
                return res.status(200).send({count: 0, error: "Could not find any breweries associated with this account."})
            }

            var breweryNamesAndIds = []
            breweries.forEach(function(element) {
                breweryNamesAndIds.push({name: element.name, id: element._id})
            })
            
            res.status(200).send({count: breweryNamesAndIds.length, names: breweryNamesAndIds})
        } catch(err) {
            res.status(400).send({count: 0, error: "Could not find any breweries associated with this user."})
        }
    })
})

router.get('/search', async(req, res) => {
    // all the search criteria to filter on
    var {name, latitude, longitude, zipCode, distance, maximumPrice, accommodationsSearch, openNow, kidFriendlyNow, minimumRating} = req.query
    
    latitude = latitude === undefined ? null : parseInt(latitude)
    longitude = longitude === undefined ? null : parseInt(longitude)
    zipCode = zipCode === undefined ? null: parseInt(zipCode)
    distance = parseInt(distance)
    maximumPrice = parseInt(maximumPrice)
    minimumRating = parseInt(minimumRating)
    openNow = openNow !== undefined && openNow === 'true' ? true : false
    kidFriendlyNow = kidFriendlyNow !== undefined && kidFriendlyNow === 'true' ? true : false
    accommodationsSearch = accommodationsSearch === undefined ? null : JSON.parse(accommodationsSearch)

    if ((!latitude || !longitude) && !zipCode) {
        return res.status(400).send({error: "Must provide a location to search in."})
    }

    // parse price and ratings critera into the start of a MongoDB search 
    const searchQuery = {
        price: {
            $lte: maximumPrice
        },
        ratings: {
            $gte: minimumRating
        }
    }

    // if we're trying to search on certain criteria, we'll add them to the 
    // searchQuery
    if (accommodationsSearch !== undefined) {
        // need to add an accommodations tag so that when we flatten
        // out the object MongoDB can reference it correctly
        var temp = {"accommodations": accommodationsSearch}
        // flatten out the object
        flattenedAccommodations = flat(temp)
        // iterate over all of the flattened accommodations tags
        // and add the key/value pair to the query object
        for (var accommodation in flattenedAccommodations) {
            accommodationName = accommodation
            accommodationValue = flattenedAccommodations[accommodationName]
            searchQuery[accommodationName] = accommodationValue
        }
    }
    
    // create the filter object that we'll use to aggregate our
    // MongoDB search on
    const filter = {
        $geoNear: {
            // provide the coordinates to do a geosearch near
            near: {
                type: "Point",
                coordinates: [ longitude, latitude ]
            },
            $maxDistance: distance,
            spherical: true,
            // we'll tack the "distance" field on to our aggregate
            // results
            distanceField: "distance",
            // multiply to convert the default MongoDB meters to miles
            // (the standard for our application)
            distanceMultiplier: 0.000621371,
            // specify the query for other objects that we want to use
            query: searchQuery
        }
    }

    var aggregate = [filter]
    var currMoment = moment().utc()
    var day = currMoment.day()

    // calculate the difference in seconds between start of the week (midnight sunday) and 
    // the time we're trying to store
    // need the (86400 * day) to add in all of the previous days in the week
    var currSeconds = currMoment.diff(currMoment.clone().startOf('day'), 'seconds') + (86400 * day)

    // if the user wants to find locations that are open at the moment, we need to add
    // a filter option to our aggregate command (see below) that will check through the
    // stored businessHours and filter out locations that are closed
    if (openNow) {
        aggregate.push(
            {"$unwind" : "$businessHours.openTimes"},
            {"$match" :
                {
                    "businessHours.openTimes.open" : {
                        "$lte": currSeconds
                    },
                    "businessHours.openTimes.close" : {
                        "$gte": currSeconds
                    }
                }
            }
        )
    }

    // same deal with if a user wants to find a place that is kidFriendly 
    // at the current moment
    if (kidFriendlyNow) {
        aggregate.push(
            {"$unwind" : "$alternativeKidFriendlyHours.openTimes"},
            {"$match" :
                {
                    "alternativeKidFriendlyHours.openTimes.open" : {
                        "$lte": currSeconds
                    },
                    "alternativeKidFriendlyHours.openTimes.close" : {
                        "$gte": currSeconds
                    }
                }
            }
        ) 
    }

    var documents = await Brewery.aggregate(aggregate)
    if (documents === undefined || documents.length === 0){
        // if we don't find any documents, we should provide a 200 response
        // to say that the search was good but that there weren't any 
        // results that came back
        console.log("Didn't find anything in aggregate")
        return res.status(200).send({count: 0, response: null})
    }

    // filter the search results even further by using a fuzzy matching algorithm
    // to compare against the name provided
    var documentsWithFuzzySearchName = []
    if (name !== undefined && name) {
        const options = {
            scorer: fuzzy.partial_token_set_ratio, // Any function that takes two values and returns a score, default: ratio
            processor: choice => choice.name,  // Takes choice object, returns string, default: no processor. Must supply if choices are not already strings.
            // limit: 2, // Max number of top results to return, default: no limit / 0.
            cutoff: 70, // Lowest score to return, default: 0
            unsorted: true, // Results won't be sorted if true, default: false. If true limit will be ignored.
            returnObjects: true
        }
        documentsWithFuzzySearchName = fuzzy.extract(name, documents, options)
    }

    // if we had fuzzy match results, update the documents to reference them
    if (documentsWithFuzzySearchName !== undefined && documentsWithFuzzySearchName.length > 0) {
        documents = []
        documentsWithFuzzySearchName.forEach(function(element) {
            documents.push(element.choice)
        })
    }

    // set the results to return to be the necessary information for each document
    // that we need to display in the frontend
    var results = []
    documents.forEach(function(element) {
        results.push(
            {
                breweryId: element._id,
                name: element.name,
                address: element.address,
                price: element.price,
                accommodations: element.accommodations,
                distance: element.distance,
                numReviews: element.comments.length
            }
        )
    })

    // return only certain information necessary for displaying
    // an individual location on the list/map view
    //      need to be careful how much data we're trying to send
    //      back to the user as sending 2kb/document could lead to immense amounts
    //      of data being sent and very slow response times
    return res.status(200).send({count: results.length, response: results.sort(function(element) {
            return element.distance
        })
    })
})

router.get(`/brewery`, async(req, res) => {
    // get all of the information for a specific document in storage
    const {breweryId} = req.query

    const brewery = await Brewery.findById(breweryId)
    if (!brewery) {
        return res.status(400).send({error: "Could not find the specified brewery location. Please try again."})
    }

    res.status(200).send({count: 1, response: [brewery]})
})

// export all of the routes for the brewery routes object
module.exports = router