require('./models/User')
require('./models/ResetToken')

const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const resetRoutes = require('./routes/passwordResetRoutes')
const bodyParser = require('body-parser')
const requireAuth = require('./middlewares/requireAuth')

const app = express()

app.use(bodyParser.json())
app.use(authRoutes)
app.use(resetRoutes)

const mongoUri = process.env.MONGODB_URI

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true
})

mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance')
})
mongoose.connection.on('error', (err) => {
    console.log('Error connecting to mongo', err)
})

app.get('/', requireAuth, (req, res) => {
    res.send(`Your email: ${req.user.email}`)
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT}`)
})