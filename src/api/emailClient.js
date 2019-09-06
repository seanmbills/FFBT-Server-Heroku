const mongoose = require('mongoose')
const User = mongoose.model('User')
const Token = mongoose.model('Token')

const nodemailer = require('nodemailer')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.TRANSPORT_EMAIL_ADDRESS}`,
        pass: `${process.env.TRANSPORT_PASSWORD}`
    }
})

module.exports = {
    sendResetEmail: async function(email, user, res) {
        const tokenValue = crypto.randomBytes(8).toString('hex')
        const userToken = Token({email: email, token: tokenValue, createdAt: Date.now()})
        await userToken.save()
        
        
        var mailOptions = {
            from: `${process.env.TRANSPORT_EMAIL_ADDRESS}`,
            to: `${user.email}`,
            subject: "Family Friendly Brewery Tracker - Password Reset Request",
            text: `Hello ${user.firstName},\n\n
You are receiving this email because you (or someone else) have requested to reset the password associated with your account.\n\n
If you made this request, please enter the following reset code into the 'Enter Code' field in the Family Friendly Brewery Tracker application.\n\n
${tokenValue}
Please note that this reset code is only valid for one hour.\n
If you did not request this password reset, please ignore this email and your password will remain unchanged.\n\n\n
Sincerely,\nThe Family Friendly Brewery Tracker team`
        }
        

        await transporter.sendMail(mailOptions, function(err, response) {
            if (err)
                return res.status(401).send({error: "We seem to have experienced an error in sending a reset request. Are you sure you haven't requested a change in the past hour?"})
            else
                return res.status(200).send({response: response})
        })
    },
    sendSuccessfulResetEmail: async function(email, user, res) {
        // need to finish the body of this email   
        var mailOptions = {
            from: `${process.env.TRANSPORT_EMAIL_ADDRESS}`,
            to: `${user.email}`,
            subject: "Family Friendly Brewery Tracker - Password Reset Request",
            text: `Hello ${user.firstName},\n\n
You are receiving this email because the password associated with your Family Friendly Brewery Tracker application has been updated.\n\n
If this wasn't you, please contact us immediately so that we can fix this change.\n\n\n
Sincerely,\nThe Family Friendly Brewery Tracker team`
        }
        

        await transporter.sendMail(mailOptions, function(err, response) {
            if (err)
                return res.status(401).send({error: "We seem to have experienced an error in sending a reset request. Are you sure you haven't requested a change in the past hour?"})
            else
                return res.status(200).send({response: response})
        })
    }
}