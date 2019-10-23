const mongoose = require('mongoose')
const NodeGeocoder = require('node-geocoder')
const geoTz = require('geo-tz')
const moment = require('moment')

const options = {
    provider: 'mapquest',
  
    httpAdapter: 'https', // Default
    apiKey: process.env.MAPQUEST_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const zipCodeRegex = /^\d{5}$/
const phoneWithDashRegex = /^\d{3}-\d{3}-\d{4}$/
const phoneWithoutDashReges = /^\d{10}$/
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
const stateRegex = /[A-Z][A-Z]/


const brewerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return stateRegex.test(v)
                },
                message: props => `${props.value} is not a valid state!`
            }
        },
        zipCode: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return zipCodeRegex.test(v);
                },
                message: props => `${props.value} is not a valid zip code!`
            },
        }
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return (v >= 0 && v <= 4)
            },
            message: props => `${props.value} is not a valid price designation!`
        }
    },
    ratings: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(v) {
                return v >= 0 && v <= 5
            },
            message: props => `${props.value} is an invalid rating!`
        }
    },
    numReviews: {
        type: Number,
        default: 0,
        required: true
    },
    geoLocation: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'] // 'location.type' must be 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    phoneNumber: {
        type: String,
        unique: true,
        validate: {
            validator: function(v) {
                return (phoneWithDashRegex.test(v) || phoneWithoutDashReges.test(v));
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    },
    email: {
        type: String,
        unique:true,
        validate: {
            validator: function(v) {
                return emailRegex.test(v)
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    website: {
        type: String,
        unique: true,
        validate: {
            validator: function(v) {
                return urlRegex.test(v)
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    businessHours: {
        timeZone: {
            type: String
        },
        openTimes: [{
            open: Number,
            close: Number
        }],
        sun: {
            type: String
        },
        mon: {
            type: String
        },
        tue: {
            type: String
        },
        wed: {
            type: String
        },
        thu: {
            type: String
        },
        fri: {
            type: String
        },
        sat: {
            type: String
        }
    },
    alternativeKidFriendlyHours: {
        timeZone: {
            type: String
        },
        openTimes: [{
            open: Number,
            close: Number
        }],
        sun: {
            type: String
        },
        mon: {
            type: String
        },
        tue: {
            type: String
        },
        wed: {
            type: String
        },
        thu: {
            type: String
        },
        fri: {
            type: String
        },
        sat: {
            type: String
        }
    },
    accommodations: {
        petFriendly: {
            waterStations: Boolean,
            indoorSpaces: Boolean,
            outdoorSpaces: Boolean
        },
        friendlyKidAges: {
            toddlers: Boolean,
            youngKids: Boolean,
            teens: Boolean
        },
        kidFoodDrinks: {
            kidFriendlyFood: Boolean,
            kidFriendlyDrinks: Boolean
        },
        changingStations: Boolean,
        childAccommodations: {
            games: {
                indoor: Boolean,
                outdoor: Boolean
            },
            seating: Boolean,
            strollerSpace: Boolean
        }
    }
})

/*
    this function is intended to convert the open and close times for 
        the given location based on a string provided to the backend
        from the frontend
    params: timeString => the string that we're trying to convert into 
                open and close times
            timeZone => the time zone that the brewery location is located
                in
            dayOfWeek => the day which we're calculating the open and 
                close times for
                - 0 = Sunday, 6 = Saturday
                - this needs to be provided in order to calculate the offset
                    of seconds from the start of the week to the
                    time we're trying to save
*/
function getOpenCloseSeconds(timeString, timeZone, dayOfWeek) {
    // split the string into open and close times
    var openClose = timeString.split(" - ")
    var open = openClose[0]
    var close = openClose[1]


    // split the open time into its component parts
    var openTime = open.substring(0, open.length - 2) 
    var openAmPm = open.substring(open.length - 2)
    var openHour = openTime.split(":")[0]
    // if the openHour is 12AM, we should set it to 0 so that it
    // gets the right time offset calculated
    openHour = openHour === "12" && openAmPm === "AM" ? "0" : openHour
    var openMin = openTime.split(":")[1]

    // split the close time into its component parts
    var closeTime = close.substring(0, close.length - 2)
    var closeAmPm = close.substring(close.length - 2)
    var closeHour = closeTime.split(":")[0]
    // same deal as above
    closeHour = closeHour === "12" && closeAmPm === "AM" ? "0" : closeHour
    var closeMin = closeTime.split(":")[1]

    // create the moment.js object for using to calculate seconds between midnight sunday (start of week)
    // and the open time of the brewery for a given day
    // takes into account the timezone of the location and also converts it to standard UTC time
    // so that we can later make a calculation as to whether the lcoation is open (when users search
    // for breweries)
    var openMoment = moment().tz(timeZone).day(dayOfWeek).hours((openAmPm === "PM" && openHour !== "12") ? parseInt(openHour) + 12 : parseInt(openHour))
        .minutes(openMin).seconds(0).milliseconds(0).utc()
    var day = openMoment.day()
    // calculate the difference in seconds between start of the week (midnight sunday) and 
    // the time we're trying to store
    // need the (86400 * day) to add in all of the previous days in the week
    var openSeconds = openMoment.diff(openMoment.clone().startOf('day'), 'seconds') + (86400 * day)

    // same deal as above but with the close time; need to do some more calculations to make sure
    // we have the right day that the lcoation closes on though
    // aka if the close time is something like 2am the following day, need to get the right
    // amount of seconds
    var closeMoment = moment().tz(timeZone).day(getCloseDay(openAmPm, closeAmPm, openHour, closeHour, dayOfWeek))
        .hours((closeAmPm === "PM" && closeHour !== "12") ? parseInt(closeHour) + 12 : parseInt(closeHour)).minutes(closeMin)
        .seconds(0).milliseconds(0).utc()
    day = closeMoment.day()
    var closeSeconds = closeMoment.diff(closeMoment.clone().startOf('day'), 'seconds') + (86400 * day)

    return [openSeconds, closeSeconds]
}

/*
    function to calculate the closing day for a location, based on the 
        times that the location opens and closes
    params: openAmPm => whether the restaurant opens in the AM or PM
            closeAmPm => closes in AM or PM
            openHour => the hour (without minutes) that the location opens at
            closeHour => closing hour
            dayOfWeek => 0 = sunday, 6 = saturday
*/
function getCloseDay(openAmPm, closeAmPm, openHour, closeHour, dayOfWeek) {
    // if the location opens in the morning and closes in the morning (AM),
    // then that means the open hours straddle midnight and we need to add one
    // to the day of the week for closing purposes (i.e. if open from 11AM on 
    // Friday and closes at 2AM on Saturday)
    if (openAmPm === "AM" && closeAmPm === "AM") {
        if (parseInt(closeHour) < parseInt(openHour)) {
            return (dayOfWeek + 1)
        } else {
            return dayOfWeek
        }
    // if location opens in afternoon and closes in morning, same deal
    } else if (openAmPm === "PM" && closeAmPm == "AM") {
        return (dayOfWeek + 1)
    // if location opens in morning and closes in afternoon, just a normal day
    } else if (openAmPm === "AM" && closeAmPm === "PM") {
        return dayOfWeek
    // if opens in evening and closes in evening, normal day
    } else {
        return dayOfWeek
    }
}

brewerySchema.pre('save', async function(next) {
    const brewery = this
    const address = brewery.address.street + ", " + brewery.address.city + ", " + brewery.address.state + " " + brewery.address.zipCode

    var lat = 0
    var long = 0

    try {
        // convert address to lat/long coordinates for using MongoDB
        // GeoJSON searches later on
        const coords = await geocoder.geocode(address)
        lat = coords[0].latitude
        long = coords[0].longitude

        if (!lat || !long) {
            next(new Error("Invalid address provided for brewery location."))
        }

        brewery.geoLocation = {
            type: "Point",
            coordinates: [long, lat]
        }
    } catch (err) {
        next(new Error("Invalid address provided for brewery location."))
    }

    var zone = ""
    try {
        // get the timeZone of the given coordinates for use
        // when trying to store time objects so we can convert to UTC
        // time for consistent searching
        zone = geoTz(lat, long)[0]
        if (zone) {
            brewery.businessHours.timeZone = zone
            brewery.alternativeKidFriendlyHours.timeZone = zone
        } else {
            next(new Error("No timezone for this location could be determined. Please try again."))
        }
    } catch (err) {
        next(new Error("No timezone for this location could be determined. Please try again."))
    }

    if (brewery.isModified('businessHours')) {
        try {
            // when user makes request to create a brewery, all they provide is the open times
            //      in a string format, i.e. '8:30AM - 10:00PM'
            // we need to convert these times into their seconds since the start of the week
            //      for later checking if a location is still open when a user makes a search request
            if (brewery.businessHours.sun && brewery.businessHours.sun !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.sun, zone, 0)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.sun = brewery.businessHours.sun.replace(/:00/g, '')
            }
            if (brewery.businessHours.mon && brewery.businessHours.mon !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.mon, zone, 1)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.mon = brewery.businessHours.mon.replace(/:00/g, "")
            }
            if (brewery.businessHours.tue && brewery.businessHours.tue !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.tue, zone, 2)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.tue = brewery.businessHours.tue.replace(/:00/g, "")
            }
            if (brewery.businessHours.wed && brewery.businessHours.wed !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.wed, zone, 3)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.wed = brewery.businessHours.wed.replace(/:00/g, "")
            }
            if (brewery.businessHours.thu && brewery.businessHours.thu !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.thu, zone, 4)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.thu = brewery.businessHours.thu.replace(/:00/g, "")
            }
            if (brewery.businessHours.fri && brewery.businessHours.fri !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.fri, zone, 5)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.fri = brewery.businessHours.fri.replace(/:00/g, "")
            }
            if (brewery.businessHours.sat && brewery.businessHours.sat !== "") {
                var openClose = getOpenCloseSeconds(brewery.businessHours.sat, zone, 6)
                brewery.businessHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.businessHours.sat = brewery.businessHours.sat.replace(/:00/g, "")
            }
        } catch (err) {
            console.log("Invalid open/close times provided.")
            next(new Error("Invalid open/close times provided. Please provide valid open/close times."))
        }
    }

    // do the same thing as above but with the "alternateKidFriendlyHours" field
    if (brewery.isModified('alternativeKidFriendlyHours'))
        try {
            // when user makes request to create a brewery, all they provide is the open times
            //      in a string format, i.e. '8:30AM - 10:00PM'
            // we need to convert these times into their seconds since the start of the week
            //      for later checking if a location is still open when a user makes a search request
            if (brewery.alternativeKidFriendlyHours.sun && brewery.alternativeKidFriendlyHours.sun !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.sun, zone, 0)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.sun = brewery.alternativeKidFriendlyHours.sun.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.mon && brewery.alternativeKidFriendlyHours.mon !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.mon, zone, 1)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.mon = brewery.alternativeKidFriendlyHours.mon.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.tue && brewery.alternativeKidFriendlyHours.tue !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.tue, zone, 2)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.tue = brewery.alternativeKidFriendlyHours.tue.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.wed && brewery.alternativeKidFriendlyHours.wed !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.wed, zone, 3)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.wed = brewery.alternativeKidFriendlyHours.wed.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.thu && brewery.alternativeKidFriendlyHours.thu !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.thu, zone, 4)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.thu = brewery.alternativeKidFriendlyHours.thu.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.fri && brewery.alternativeKidFriendlyHours.fri !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.fri, zone, 5)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.fri = brewery.alternativeKidFriendlyHours.fri.replace(/:00/g, "")
            }
            if (brewery.alternativeKidFriendlyHours.sat && brewery.alternativeKidFriendlyHours.sat !== "") {
                var openClose = getOpenCloseSeconds(brewery.alternativeKidFriendlyHours.sat, zone, 6)
                brewery.alternativeKidFriendlyHours.openTimes.push({open: openClose[0], close: openClose[1]})
                brewery.alternativeKidFriendlyHours.sat = brewery.alternativeKidFriendlyHours.sat.replace(/:00/g, "")
            }
        } catch (err) {
            console.log("Invalid family friendly open/close times provided.")
            next(new Error("Invalid family friendly open/close times provided. Please provide valid open/close times."))
        } 
    
    
    next()
    
})

brewerySchema.index({ "geoLocation": "2dsphere" });


mongoose.model('Brewery', brewerySchema)