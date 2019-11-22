const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const Review = mongoose.model('Review')
const jwt = require('jsonwebtoken')


const router = express.Router()

const loginErrorMessage = "You must be logged in to write a review!"

router.post('/createReview', async (req, res) => {
    const {authorization} = req.headers

    if (!authorization) {
        return res.status(401).send({error: loginErrorMessage})
    }

    const {message, breweryId, rating} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async(err, payload) => {
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({error: "No user exists with this id. Please ensure you provide a valid authorization token."})
        }

        const brewery = await Brewery.findById(breweryId)
        if (!brewery) {
            return res.status(404).send({error: "No brewery exists with this id. Please ensure you're writing a review for a valid brewery location."})
        }

        try {
            var poster = {
                id: userId,
                username: user.userId
            }

            const review = new Review({message, poster, breweryId: brewery._id, rating, postedDate: Date.now()})
            await review.save()

            res.send({response: "Your review has been successfully added!"})
        } catch (err) {
            return res.status(422).send({error: err.message})
        }
    })
})

router.post('/editReview', async(req, res) => {
    const {authorization} = req.headers

    if (!authorization) {
        return res.status(401).send({error: loginErrorMessage})
    }

    const {reviewId, newMessage, newRating} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async(err, payload) => {
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        try {
            const review = await Review.findById(reviewId, function (err, doc) {
                if (err) {
                    return res.status(404).send({error: "Couldn't find a review with that id."})
                }

                if (String(userId).trim() !== String(doc._doc.poster.id).trim()) {
                    return res.status(401).send({error: "This user is not authorized to update this review."})
                }
            })
            if (!review) {
                return res.status(404).send({error: "No review exists with this id. Please ensure you're accessing a valid review."})

            }

            const brewery = await Brewery.findById(review.breweryId, async function(err, doc) {
                if (err) {
                    next(new Error("Must provide a valid brewery id for the review."))
                }
        
                try {
                    var newRating = doc.ratings * doc.numReviews
                    console.log(newRating)
                    newRating = newRating - review.rating
                    console.log(newRating)
                    newRating = newRating / (doc.numReviews - 1)
                    console.log(newRating)
        
                    var newReviews = doc.numReviews - 1
                    console.log(newReviews)
        
                    doc._doc = {...doc._doc, ratings: newRating, numReviews: newReviews}
                    doc.markModified('ratings')
                    doc.markModified('numReviews')
        
                    console.log(doc)

                    await doc.save()
                    console.log('saved')
                } catch (err) {
                    next(new Error(err.message))
                }
            })

            const newReview = new Review({message: newMessage, poster: review.poster, breweryId: review.breweryId, rating: newRating, postedDate: Date.now()})
            await newReview.save()

            return res.status(200).send({count: 1, response: "Successfully updated your review!"})
        } catch (err) {
            return res.status(422).send({error: "Experienced an issue while trying to update this review. Please try again later."})
        }
    })
})

router.get('/getBreweryReviews', async (req, res) => {
    var {breweryId} = req.query

    const breweryReviews = await Review.find({breweryId})
    if (!breweryReviews || breweryReviews.length === 0) {
        return res.status(200).send({count: 0, response: "No reviews exist for this location."})
    }
    return res.status(200).send({count: breweryReviews.length, response: breweryReviews})
})

router.get('/review', async(req, res) => {
    var {reviewId} = req.query

    const review = await Review.findById(reviewId)
    if (!review) {
        return res.status(404).send({error: "No review could be found with this id. Please try again."})
    }

    return res.status(200).send({count: 1, response: review})
})

router.get('/getOwnedReviews', async(req, res) => {
    const {authorization} = req.headers

    if (!authorization) {
        return res.status(401).send({error: loginErrorMessage})
    }

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        try {
            const {userId} = payload
            var reviews = await Review.find({"poster.id": userId})

            if (!reviews) {
                return res.status(200).send({count: 0, error: "Could not find any breweries associated with this account."})
            }

            res.status(200).send({count: reviews.length, ownedReviews: reviews})
        } catch(err) {
            res.status(422).send({count: 0, error: "Could not find any breweries associated with this user."})
        }
    })
})

// export all of the routes for the brewery routes object
module.exports = router