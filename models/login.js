const { Schema, model } = require('mongoose');

const Login = new Schema({
    widgetUserSubdomain:{ type: String, require: true },
    accountId: { type: Number },
    paid: { type: Boolean }, 
    installed: { type: Boolean }, 
    testPeriod: { type: Boolean },
    startUsingDate: { type: String },
    finishUsingDate: { type: String }
});

module.exports = model('Login', Login);

