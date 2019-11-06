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
        return res.status(400).send({error: loginErrorMessage})
    }

    const {message, breweryId, rating} = req.body

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async(err, payload) => {
        if (err) {
            return res.status(400).send({error: loginErrorMessage})
        }

        const {userId} = payload

        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).send({error: "No user exists with this id. Please ensure you provide a valid authorization token."})
        }

        const brewery = await Brewery.findById(breweryId)
        if (!brewery) {
            return res.status(401).send({error: "No brewery exists with this id. Please ensure you're writing a review for a valid brewery location."})
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
        const review = await Review.findById(reviewId, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find a review with this id. Please try again."})
            }

            if (String(userId).trim() !== String(doc.poster.id).trim()) {
                return res.status(400).send({error: "This user is not authorized to edit this review."})
            }

            try {
                doc._doc = {...doc._doc}

                if (newMessage) {
                    doc._doc = {...doc._doc, message: newMessage}
                    doc.markModified('message')
                }
                if (newRating) {
                    doc._doc = {...doc._doc, rating: newRating}
                    doc.markModified('rating')
                }

                await doc.save()
                return res.status(200).send({count: 1, response: "Successfully updated your review!"})
            } catch (err) {
                return res.status(401).send({error: "Experienced an issue while trying to update this review. Please try again later."})
            }
        })
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
        return res.status(400).send({error: "No review could be found with this id. Please try again."})
    }

    return res.status(200).send({count: 1, response: review})
})

// export all of the routes for the brewery routes object
module.exports = router