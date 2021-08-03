const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    cmdtyName: {
        type: String,
    },
    cmdtyID: {
        type: String,
        required: true,
    },
    marketID: {
        type: String,
        required: true,
    },
    marketName: {
        type: String,
    },
    users: [
        {
            user: {
                type: String,
            },
        },
    ],
    timestamp: {
        type: Date,
        default: Date.now,
    },
    priceUnit: {
        type: String,
        default: 'Kg',
    },
    convPrice: [
        {
            price: {
                type: Number,
            },
        },
    ],
    price: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Reports', reportSchema);
