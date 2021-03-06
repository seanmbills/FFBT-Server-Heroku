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
    breweryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brewery',
        required: true
    },
    breweryName: {
        type: String,
        required: true,
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
    
    const brewery = await Brewery.findById(review.breweryId, async function(err, doc) {
        if (err) {
            next(new Error("Must provide a valid brewery id for the review."))
        }

        try {
            var newRating = doc.ratings * doc.numReviews
            newRating = newRating + review.rating
            newRating = newRating / (doc.numReviews + 1)

            var newReviews = doc.numReviews + 1
            
            doc._doc = {...doc._doc, ratings: newRating, numReviews: newReviews}
            doc.markModified('ratings')
            doc.markModified('numReviews')

            console.log(doc)
            await doc.save()
            console.log('saved new review')
        } catch (err) {
            // next(new Error("Experienced an issue when saving this review. Please try again later."))
            next(new Error(err.message))
        }
    })

    next()
})


mongoose.model('Review', reviewSchema)