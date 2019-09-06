const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')

const router = express.Router()

const invalidMessage = "Invalid email or password."

router.post('/signin', async(req, res) => {
    const {emailOrId, password} = req.body
    
    if (!email || !password) {
        return res.status(422).send({error: "Must provide a valid email, or User Id, and a valid password."})
    }

    const user = await User.findOne({emailOrId})
    if (!user) {
        return res.status(401).send({error: invalidMessage})
    }

    try {
        await user.comparePassword(password)

        const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
        res.send({token})
    } catch (err) {
        return res.status(401).send({error: invalidMessage})
    }
})

router.post('/signup', async (req, res) => {
    const {email, userId, password, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader} = req.body
    try {
        const user = new User({email, userId, password, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader})

        await user.save()

        const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
        res.send({token})
    } catch (err) {
        return res.status(422).send(err.message)
    }
})

module.exports = router