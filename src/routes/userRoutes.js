const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')

const router = express.Router()

const invalidMessage = "Invalid email or password."
const loginErrorMessage = "You must be logged in!"

router.post('/userUpdate', async(req, res) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    const {firstName, lastName, zipCode} = req.body

    if (!authorization) {
        console.log("No authorization token provided for user update.")
        return res.status(401).send({error: loginErrorMessage})
    }

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload

        var user = await User.findById(userId, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find a user with that email address."})
            }

            var first = firstName === '' ? user._doc.firstName : firstName
            var last = lastName === '' ? user._doc.lastName : lastName
            var zip = zipCode === null ? user._doc.zipCode : zipCode

            try {
                doc._doc = {...user._doc, zipCode : zip, firstName: first , lastName: last, updatedDate:Date.now()}
                if (firstName !== '')
                    doc.markModified('firstName')
                if (lastName !== '')
                    doc.markModified('lastName')
                if (zipCode !== null) 
                    doc.markModified('zipCode')
                await doc.save()
    
                const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
                res.send({token})
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })

        req.user = user
    })
})

// add ability to update password
// should require additional auth (aka old password) to do so
router.post('/updatePassword', async(req, res) => {
    const {authorization} = req.headers
    console.log("Auth token: " + authorization)
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    const {oldPassword, newPassword} = req.body

    if (!authorization) {
        console.log("No authorization token provided for update password.")
        console.log({error: loginErrorMessage})
        return res.status(401).send({error: loginErrorMessage})
    }

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find your account. Please ensure you are logged in."})
            }

            try {
                await doc.comparePassword(oldPassword).catch(function() {
                    return res.status(400).send({error: invalidMessage})
                })
                
                doc._doc = {...doc._doc, password: newPassword, updatedDate: Date.now()}
                doc.markModified('password')
                await doc.save()

                const token = jwt.sign({userId: doc._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
                res.send({token})
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })
        

        req.user = user
    })
})

//add ability to update email
// should required additional auth (aka password) to do so
router.post('/updateEmail', async(req, res) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    const {newEmail, password} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find a user with that email address."})
            }
            try {
                await doc.comparePassword(password).catch(function() {
                    return res.status(400).send({error: invalidMessage})
                })
                
                doc._doc = {...doc._doc, email: newEmail, updatedDate: Date.now()}
                doc.markModified('email')
                await doc.save()

                const token = jwt.sign({userId: doc._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
                res.send({token})
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })
        

        req.user = user
    })
})

// add ability to update user's phone number
// should require additional auth (aka userId/email and password) to do so
router.post('/updatePhone', async(req, res) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    const {password, newPhone} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId, async function(err, doc) {
            if (err) {
                return res.status(400).send({error: "Couldn't find your account. Please make sure you are logged in."})
            }

            try {
                await doc.comparePassword(password).catch(function() {
                    return res.status(400).send({error: invalidMessage})
                })
                
                doc._doc = {...doc._doc, phoneNumber: newPhone, updatedDate: Date.now()}
                doc.markModified('phoneNumber')
                await doc.save()

                const token = jwt.sign({userId: doc._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
                res.send({token})
            } catch (err) {
                return res.status(401).send({error: err})
            }
        })
        req.user = user
    })
})

module.exports = router