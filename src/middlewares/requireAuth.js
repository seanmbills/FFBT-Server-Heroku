const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const loginErrorMessage = "You must be logged in!"

module.exports = (req, res, next) => {
    const {authorization} = req.headers
    // authorization == 'Bearer _________;
    // need to string out 'Bearer' later

    if (!authorization)
        return res.status(401).send({error: loginErrorMessage})

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.MONGO_SECRET_KEY, async (err, payload) => {
        
        if (err) {
            return res.status(401).send({error: loginErrorMessage})
        }

        const {userId} = payload
        const user = await User.findById(userId)

        req.user = user
        next()
    })
}