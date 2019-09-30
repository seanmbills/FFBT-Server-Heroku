const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    poster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    brewery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brewery'
    },
    rating: {
        type: Number,
        required: true,
    }
})


mongoose.model('Review', reviewSchema)