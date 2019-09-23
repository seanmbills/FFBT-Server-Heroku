const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Token = mongoose.model('Token')
const EmailClient = require('../api/emailClient')

const router = express.Router()

const invalidMessage = "Please provide a valid email address."
const invalidToken = "The Password Reset code provided is invalid, or has expired."

router.post('/forgotPassword', async(req, res) => {
    const {emailOrId} = req.body
    
    if (!emailOrId || emailOrId === '') {
        return res.status(422).send({error: invalidMessage})
    }

    const user = await User.findOne({$or: [{'email': emailOrId}, {'userId': emailOrId}]})
    if (!user) {
        return res.status(401).send({error: invalidMessage})
    }

    try {
        return await EmailClient.sendResetEmail(user.email, user, res)
    } catch (err) {
        return res.status(401).send({error: err})
    }
})

router.post('/resetPassword', async(req, res) => {
    const {emailOrId, resetCode, newPassword} = req.body

    if (!emailOrId || emailOrId === '')
        return res.status(401).send({error: "Must provide a valid email address or username."})
    if (!resetCode || resetCode === '')
        return res.status(401).send({error: "Must provide a valid reset code."})
    if (!newPassword || newPassword === '')
        return res.status(401).send({error: "Must provide a valid password."})

    var user = await User.findOne({$or: [{'email': emailOrId}, {'userId': emailOrId}]})
    if (!user) {
        return res.status(401).send({error: invalidMessage})
    }

    const token = await Token.findOne({email: user.email})
    if (!token) {
        return res.status(401).send({error: invalidToken})
    }
    
    try {
        await token.compareToken(resetCode)
        
        try {
            user._doc = {...user._doc, password: newPassword, updatedDate: Date.now()}
            user.markModified('password')
            await user.save()
        } catch (err) {
            return res.status(401).send({error: err})
        }

        await EmailClient.sendSuccessfulResetEmail(user.email, user, res)
        return res.status(200).send({updatedAccount: user.email})
    } catch (err) {
        return res.status(401).send({error: 'Please provide a valid token.'})
    }
})

module.exports = router