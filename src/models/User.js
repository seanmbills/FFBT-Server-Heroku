const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        unique: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],

    }, 
    password: {
        type: String,
        required: true,
        min: [10, "Password must be at least 10 characters."]
    }
})

userSchema.pre('save', function(next) {
    const user = this

    if (!user.isModified('password')) {
        return next()
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            user.password = hash
            next()
        })
    })
})



userSchema.methods.comparePassword = function(enteredPassword) {
    const user = this
    return new Promise((resolve, reject) => {
        bcrypt.compare(enteredPassword, user.password, (err, isMatch) => {
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


mongoose.model('User', userSchema)