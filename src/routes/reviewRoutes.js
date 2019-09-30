const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const Review = mongoose.model('Review')


const router = express.Router()

const loginErrorMessage = "You must be logged in to write a review!"

router.post('/createReview', async (req, res) => {
    const {authorization} = req.headers

    if (!authorization) {
        return res.status(400).send({error: loginErrorMessage})
    }
})

// export all of the routes for the brewery routes object
module.exports = router