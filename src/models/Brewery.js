const mongoose = require('mongoose')
const NodeGeocoder = require('node-geocoder')

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
    // console.log(address)
    try {
        const coords = await geocoder.geocode(address)
        // console.log(coords)

        brewery.geoLocation = {
            type: "Point",
            coordinates: [coords[0].longitude, coords[0].latitude]
        }
        next()
    } catch (err) {
        return res.status(400).send({error: "Invalid address provided for brewery location."})
    }
})

brewerySchema.index({ "geoLocation.coordinates": "2dsphere" });


mongoose.model('Brewery', brewerySchema)