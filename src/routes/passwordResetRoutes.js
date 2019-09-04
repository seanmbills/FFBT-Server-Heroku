const express = require('express')
const mongoose = require('mongoose')
const crypto = require('crypto')
const User = mongoose.model('User')
const nodemailer = require('nodemailer')

const router = express.Router()

router.post('/forgotPassword', async(req, res) => {
    const {email} = req.body
    
    if (!email || email === '') {
        return res.status(422).send({error: "Must provide an email."})
    }

    const user = await User.findOne({email})
    if (!user) {
        console.log(`Couldn't find email matching: ${email}`)
        return res.status(401).send({error: invalidMessage})
    }

    try {
        const token = crypto.randomBytes(2).toString('hex')
        console.log(token)
        // res.send({token})
    } catch (err) {
        return res.status(401).send({error: invalidMessage})
    }
})

module.exports = router