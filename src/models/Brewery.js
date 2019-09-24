const mongoose = require('mongoose')
const NodeGeocoder = require('node-geocoder')
const geoTz = require('geo-tz')

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
const amPmRegex = /[AaPp][Mm]/
const priceRegex = /\${1,4}/
const stateRegex = /[A-Z][A-Z]/


const brewerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nGrams: {
        type: [String]
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
                message: props => `${props.value} is not a valid phone number!`
            },
        }
    },
    price: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return (v.length > 0 && v.length < 5 && priceRegex.test(v))
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
    geoLocation: {
        // type: { type: String },
        // coordinates: []
        // coordinates: { type: [Number], index: '2dsphere'}
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
        Sunday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Monday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Tuesday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Wednesday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Thursday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Friday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Saturday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        }
    },
    alternativeKidFriendlyHours: {
        Sunday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Monday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Tuesday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Wednesday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Thursday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Friday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        },
        Saturday: {
            openTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            },
            closeTime: {
                time: Number,
                designator: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return amPmRegex.test(v)
                        },
                        message: props => `${props.value} is not a valid time!`
                    }
                }
            }
        }
    },
    comments: [
        // TODO: need to ipmlement this later in sprint 5
    ],
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

brewerySchema.pre('save', async function(next) {
    const brewery = this
    const address = brewery.address.street + ", " + brewery.address.city + ", " + brewery.address.state + " " + brewery.address.zipCode
    
    try {
        // convert address to lat/long coordinates for using MongoDB
        // GeoJSON searches later on
        const coords = await geocoder.geocode(address)
        // console.log(coords)
        var lat = coords[0].latitude
        var long = coords[0].longitude

        if (!lat || !long)
            return res.status(400).send({error: "Invalid address provided for brewery location."})

        brewery.geoLocation = {
            type: "Point",
            coordinates: [long, lat]
        }

        // get the timeZone of the given coordinates for use
        // when trying to store time objects so we can convert to UTC
        // time for consistent searching
        // var zone = geoTz(lat, long)
        // if (!zone) {
        //     brewery.businessHours.timeZone = zone
        //     brewery.alternativeKidFriendlyHours.timeZone = zone
        // }
        
        next()
    } catch (err) {
        return res.status(400).send({error: "Invalid address provided for brewery location."})
    }
})

brewerySchema.index({ "geoLocation": "2dsphere" });


mongoose.model('Brewery', brewerySchema)