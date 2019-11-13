const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')

const AwsClient = require('../api/awsClient')

const router = express.Router()

const invalidMessage = "Invalid email or password."

router.post('/signin', async(req, res) => {
    const {emailOrId, password} = req.body
    
    if (!emailOrId || !password) {
        if (!emailOrId) console.log("no email or id provided")
        if (!password) console.log("no password provided")
        return res.status(422).send({error: "Must provide a valid email, or User Id, and a valid password."})
    }

    const user = await User.findOne({$or: [{'email': emailOrId}, {'userId': emailOrId}]})
    if (!user) {
        console.log("no user found with that id or email")
        return res.status(401).send({error: invalidMessage})
    }

    try {
        await user.comparePassword(password)

        const accessToken = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '5m'})
        const refreshToken = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY2, {expiresIn: '7d'})
        res.send({accessToken, refreshToken})
    } catch (err) {
        return res.status(401).send({error: invalidMessage})
    }
})

router.post('/signup', async (req, res) => {
    const {email, userId, password, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader} = req.body
    try {
        const user = new User({email, userId, password, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader})

        await user.save()
        
        // get the AWS signed URL to return to the user to post their profile pic to
        // the AWS S3 instance
        const signedUrl = AwsClient.getPostImageSignedUrl(`${userId}.jpg`, 'accountImages')

        const accessToken = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '5m'})
        const refreshToken = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY2, {expiresIn: '7d'})
        res.send({accessToken, refreshToken, signedUrl})
    } catch (err) {
        return res.status(422).send({error: err.message})
    }
})

router.post('/refreshAuth', async (req, res) => {
    const {authorization} = req.headers
    try {
        const refreshToken = authorization.replace('Bearer ', '')
        jwt.verify(refreshToken, process.env.MONGO_SECRET_KEY2, async(err, payload) => {
            if (err) {
                return res.status(401).send({error: loginErrorMessage})
            }

            const {userId} = payload

            const accessToken = jwt.sign({userId}, process.env.MONGO_SECRET_KEY, {expiresIn: '5m'})
            return res.status(200).send({accessToken})
        })
    } catch(err) {
        return res.status(422).send({error: err.message})
    }
})

module.exports = router