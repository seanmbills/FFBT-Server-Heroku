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
    const {email, confirmPassword, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader} = req.body

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        const user = await User.findById(userId)
        const password = user.password
        const userEmail = user.email

        try {
            await user.comparePassword(confirmPassword)
    
            const newUserInfo = {userEmail, password, birthDate, firstName, lastName, phoneNumber, zipCode, testHeader}
            const query = {_id: userId}
            await User.findOneAndUpdate(query, newUserInfo, {upsert:false}, function(err, doc){
                if (err) return res.status(500).send({ error: err });
            });

            const token = jwt.sign({userId: user._id}, process.env.MONGO_SECRET_KEY, {expiresIn: '1h'})
            res.send({token})
        } catch (err) {
            return res.status(401).send({error: err})
        }

        req.user = user
        next()
    })
})

// add ability to update password
// should require additional auth (aka old password) to do so


//add ability to update email
// should required additional auth (aka password) to do so

module.exports = router