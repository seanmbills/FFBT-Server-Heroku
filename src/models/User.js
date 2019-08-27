const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    // email needs to match the universal regex check for an email
    email: {
        type: String, 
        unique: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],

    }, 
    // password should be at least 10 characters...can come back to this for changes later
    password: {
        type: String,
        required: true,
        min: [10, "Password must be at least 10 characters."]
    },
    // birthdate should be at least 21 years old
    birthDate: {
        type: Date,
        required: true,
        default: Date.now,
        validate: {
            validator: function (v) {
                return new Date(v.getYear()+21, v.getMonth()-1, v.getDay()) <= new Date();
            },
            message: 'You must be at least 21 years old'
        }
    }, 
    firstName: {
        type: String,
        required: true
    }, 
    lastName: {
        type: String,
        required: true,
    },
    // phone number needs to match the standard XXX-XXX-XXXX format
    phoneNumber: {
        type: Number,
        minlength: [10, 'You must enter a valid phone number'],
        maxlength: [11, 'You must enter a valid phone number'],
        required: [true, 'User phone number required']
    },
    // zip code should match the standard XXXXX format
    zipCode: {
        type: Number,
        minlength: [5, 'Enter a valid Zip Code'],
        maxlength: [5, 'Enter a valid zip code'],
        required: [true, 'Zip Code required']
    },
    // keep track of the date/time at which a user initially creates their account
    createdDate: {
        type: Date, 
        default: Date.now
    },
    // test header for when developers manually insert data for testing
    testHeader: {
        createdBy: {
            type: String,
            default: ''
        }, 
        createdDate: {
            type: Date, 
            default: Date.now
        }
    }
    /* FUTURE WORK: 
        1) should look into adding in a "lastLoggedIn" field
        2) further validation of passwords (aka special character, number, etc.)
        3) should look into a retention length/date for test header items
    */
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