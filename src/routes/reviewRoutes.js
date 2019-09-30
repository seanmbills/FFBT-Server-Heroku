const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Brewery = mongoose.model('Brewery')
const Review = mongoose.model('Review')


const router = express.Router()

const loginErrorMessage = "You must be logged in to create a new brewery location."



// export all of the routes for the brewery routes object
module.exports = router