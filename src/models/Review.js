const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    poster: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user: {
            type: String,
            required: true
        }
    },
    brewery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brewery',
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    postedDate: {
        type: Date,
        required: true,
        default: Date.now
    }
})


mongoose.model('Review', reviewSchema)