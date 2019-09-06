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
    const {confirmPassword, birthDate, firstName, lastName, phoneNumber, zipCode} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId)

        try {
            await user.comparePassword(confirmPassword).catch(function() {
                return res.status(400).send({error: invalidMessage})
            })

            user._doc = {...user._doc, birthDate, zipCode, firstName, lastName, phoneNumber, updatedDate:Date.now()}
            
            const query = {_id: userId}
            await User.findOneAndUpdate(query, user, {upsert:false, runValidators:true}, function(err, doc){
                if (err) return res.status(500).send({ error: 'failed to update' });
            });

            const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
            res.send({token})
        } catch (err) {
            return res.status(401).send({error: err})
        }

        req.user = user
    })
})

// add ability to update password
// should require additional auth (aka old password) to do so
router.post('/updatePassword', async(req, res) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later
    const {email, oldPassword, newPassword} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId, async function(err, doc) {
            const userEmail = doc.email

            try {
                await doc.comparePassword(oldPassword).catch(function() {
                    return res.status(400).send({error: invalidMessage})
                })
                if (userEmail !== email)
                    return res.status(401).send({error: "Invalid account login credentials."})
        
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
    const {oldEmail, newEmail, password} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        var user = await User.findById(userId, async function(err, doc) {
            const userEmail = doc.email

            try {
                await doc.comparePassword(password).catch(function() {
                    return res.status(400).send({error: invalidMessage})
                })
                if (userEmail !== oldEmail)
                    return res.status(401).send({error: "Invalid account login credentials."})
        
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

module.exports = router