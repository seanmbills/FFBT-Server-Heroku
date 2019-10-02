const mongoose = require('mongoose')
const Brewery = mongoose.model('Brewery')

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
        username: {
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

reviewSchema.pre('save', async function(next) {
    const review = this
    
    const brewery = await Brewery.findById(brewery, async function(err, doc) {
        if (err) {
            next(new Error("Must provide a valid brewery id for the review."))
        }

        try {
            var newRating = doc.rating * doc.comments.length
            newRating = newRating * review.rating
            newRating = newRating / (doc.comments.length + 1)

            var newComments = doc.comments
            newComments.push(review._id)
            
            doc._doc = {...doc._doc, rating: newRating, comments: newComments}
            doc.markModified('rating')
            doc.markModified('comments')

            await doc.save()
        } catch (err) {
            next(new Error("Experienced an issue when saving this review. Please try again later."))
        }
    })

    next()
})


mongoose.model('Review', reviewSchema)