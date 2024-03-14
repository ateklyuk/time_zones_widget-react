import {Schema, model} from 'mongoose';

const Login = new Schema({
    widgetUserSubdomain:{ type: String, require: true },
    accountId: { type: Number },
    paid: { type: Boolean }, 
    installed: { type: Boolean }, 
    testPeriod: { type: Boolean },
    startUsingDate: { type: String },
    finishUsingDate: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String }
});

export default model('Login', Login);

