const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')
const nodemailer = require('nodemailer')

const router = express.Router()



module.exports = router