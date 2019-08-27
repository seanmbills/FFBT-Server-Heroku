const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')

const router = express.Router()

const invalidMessage = "Invalid email or password."

router.post('/signin', async(req, res) => {
    const {email, password} = req.body
    
    if (!email || !password) {
        return res.status(422).send({error: "Must provide email and password."})
    }

    const user = await User.findOne({email})
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
    const {email, password, birthDate, firstName, lastName, phoneNumber, zipCode} = req.body
    try {
        const user = new User({email, password, birthDate, firstName, lastName, phoneNumber, zipCode})

        await user.save()

        const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
        res.send({token})
    } catch (err) {
        return res.status(422).send(err.message)
    }
})

router.get('/userInfo', async(req, res) => {
    const user = await User.findById
})

module.exports = router