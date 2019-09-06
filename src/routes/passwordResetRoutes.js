const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Token = mongoose.model('Token')
const EmailClient = require('../api/emailClient')

const router = express.Router()

const invalidMessage = "Please provide a valid email address."
const invalidToken = "The Password Reset code provided is invalid, or has expired."

router.post('/forgotPassword', async(req, res) => {
    const {email} = req.body
    
    if (!email || email === '') {
        return res.status(422).send({error: invalidMessage})
    }

    const user = await User.findOne({email})
    if (!user) {
        return res.status(401).send({error: invalidMessage})
    }

    try {
        return await EmailClient.sendResetEmail(email, user, res)
    } catch (err) {
        return res.status(401).send({error: err})
    }
})

router.post('/resetPassword', async(req, res) => {
    const {email, resetCode, newPassword} = req.body

    if (!email || email === '')
        return res.status(401).send({error: "Must provide a valid email address."})
    if (!resetCode || resetCode === '')
        return res.status(401).send({error: "Must provide a valid reset code."})
    if (!newPassword || newPassword === '')
        return res.status(401).send({error: "Must provide a valid password."})

    const token = await Token.findOne({email})
    if (!token) {
        return res.status(401).send({error: invalidToken})
    }
    
    try {
        await token.compareToken(resetCode)
        
        var user = await User.findOne({email}, async function (err, doc) {
            if (err) {
                return res.status(401).send({error: err})
            }
            try {
                doc._doc = {...doc._doc, password: newPassword, updatedDate: Date.now()}
                doc.markModified('password')
                await doc.save()
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })
        await EmailClient.sendSuccessfulResetEmail(email, user, res)
        return res.status(200).send({updatedAccount: user.email})
    } catch (err) {
        return res.status(401).send({error: 'Please provide a valid token.'})
    }
})

module.exports = router