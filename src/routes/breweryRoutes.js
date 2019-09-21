const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const jwt = require('jsonwebtoken')


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
    const {} = req.body

    // parse filter critera into a MongoDB search 

    // return only certain information necessary for displaying
    // an individual location on the list/map view
    //      need to be careful how much data we're trying to send
    //      back to the user as sending 2kb/document could lead to immense amounts
    //      of data being sent and very slow response times

})

router.get(`/search/${id}`, async(req, res) => {
    // get all of the information for a specific document in storage
})


module.exports = router