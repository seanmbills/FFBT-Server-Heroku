const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const tokenSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (v) {
                return emailRegex.test(v)
            },
            message: props => `${props.value} is not a valid email address.`
        }
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now,
        required: true,
        expires: 3600
    }
})

tokenSchema.pre('save', function(next) {
    const token = this

    if (!token.isModified('token'))
        return next
    
    bcrypt.genSalt(10, (err, salt) => {
        if (err) 
            return next(err)

        bcrypt.hash(token.token, salt, (err, hash) => {
            if (err)
                return next(err)

            token.token = hash
            next()
        })
    })
})

tokenSchema.methods.compareTokens = function(enteredToken) {
    const token = this
    return new Promise((resolve, reject) => {
        bcrypt.compare(enteredToken, token.token, (err, isMatch) => {
            if (err) {
                return reject(err)
            }

            if (!isMatch) {
                return reject(false)
            }

            resolve(true)
        })
    })
}

mongoose.model('Token', tokenSchema)