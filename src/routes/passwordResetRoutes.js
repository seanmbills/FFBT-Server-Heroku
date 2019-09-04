const express = require('express')
const mongoose = require('mongoose')
const crypto = require('crypto')
const User = mongoose.model('User')
const Token = mongoose.model('Token')
const nodemailer = require('nodemailer')

const router = express.Router()

router.post('/forgotPassword', async(req, res) => {
    const {email} = req.body
    
    if (!email || email === '') {
        return res.status(422).send({error: "Must provide an email."})
    }

    const user = await User.findOne({email})
    if (!user) {
        console.log(`Couldn't find email matching: ${email}`)
        return res.status(401).send({error: invalidMessage})
    }

    try {
        const tokenValue = crypto.randomBytes(8).toString('hex')
        const userToken = Token({email: email, token: tokenValue, createdAt: Date.now()})
        await userToken.save()

        console.log('token successfully saved')
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.TRANSPORT_EMAIL_ADDRESS}`,
                pass: `${process.env.TRANSPORT_PASSWORD}`
            }
        })

        console.log('created transporter')

        const mailOptions = {
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

        console.log('created mailOptions')

        await transporter.sendMail(mailOptions, function(err, response) {
            if (err)
                return res.status(401).send({error: err})
            else
                return res.status(200).send({response: response})
        })
    } catch (err) {
        return res.status(401).send({error: err})
    }
})

module.exports = router