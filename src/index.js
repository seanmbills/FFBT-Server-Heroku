require('./models/User')
require('./models/ResetToken')
require('./models/Brewery')
require('./models/Review')

const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const resetRoutes = require('./routes/passwordResetRoutes')
const userRoutes = require('./routes/userRoutes')
const breweryRoutes = require('./routes/breweryRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const bodyParser = require('body-parser')
const requireAuth = require('./middlewares/requireAuth')

const app = express()

app.use(bodyParser.json())
app.use(authRoutes)
app.use(resetRoutes)
app.use(userRoutes)
app.use(breweryRoutes)
app.use(reviewRoutes)

const mongoUri = process.env.MONGODB_URI

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
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