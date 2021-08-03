const express = require('express');
const mongoose = require('mongoose');

const Report = require('./models/reports');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
try {
    mongoose.connect(mongoURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });

    console.log('MongoDB connected');
} catch (error) {
    console.log(error);
}

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/reports', async (req, res) => {
    const {
        userID,
        marketID,
        marketName,
        cmdtyID,
        cmdtyName,
        convFctr,
        price,
    } = req.body.reportDetails;

    try {
        let report = await Report.find({ marketID, cmdtyID });

        if (!(report.length === 0)) {
            //if report exists already
            report = report[0];
            const currPrice = price / convFctr; //converting to base price

            report.users.push({ user: userID }); //pushing data of new user
            report.convPrice.push({ price: currPrice });

            let totalPrice = 0; //calculating total price
            report.convPrice.map((obj) => (totalPrice += obj.price));

            report.price = totalPrice / report.convPrice.length;
            await report.save();
        } else {
            const users = [];
            const convPrice = [];

            report = new Report({
                cmdtyName,
                cmdtyID,
                marketID,
                marketName,
                users,
                convPrice,
                price,
            });

            const currPrice = price / convFctr; //base price

            report.users.push({ user: userID }); //pushing new data
            report.convPrice.push({ price: currPrice });
            report.price = currPrice; //storing new final price

            await report.save();
        }

        res.json({ status: 'success', reportID: report._id });
    } catch (error) {
        console.log(error);
        res.json({ status: 'failure' });
    }
});

app.get('/reports', async (req, res) => {
    const reportID = req.query.reportID;

    try {
        const report = await Report.findById(reportID);
        res.json({
            _id: reportID,
            cmdtyName: report.cmdtyName,
            cmdtyID: report.cmdtyID,
            marketID: report.marketID,
            marketName: report.marketName,
            users: report.users.map((user) => user.user),
            timestamp: report.timestamp,
            priceUnit: report.priceUnit,
            price: report.price.toFixed(2), //to handle floating-point values
        });
    } catch (error) {
        console.log(error);
        res.json({ status: 'failure' });
    }
});

app.listen(port, (error) => {
    if (error) console.log(error);
    console.log(`Server started on port ${port}`);
});
