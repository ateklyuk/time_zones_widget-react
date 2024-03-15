import express from "express";
import cors from "cors";
import moment from "moment";
import mongoose from "mongoose";
import fs from "fs";
import TZ_prefixes from "./models/Timezones";
import Login from './models/login';
// import Api from "./api";
import {config} from "./config";
const app = express();
import {mainLogger, getUserLogger} from "./logger";
import axios from "axios";
import router from "./routes/routes";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", router)

const CONNECTION_OPTIONS = {
    maxPoolSize: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

app.listen(config.PORT, async () => {
    mongoose.connect(config.DB_URL, CONNECTION_OPTIONS)
        .then(() => mainLogger.debug("Database connection has been successful"))
        .catch((err) => mainLogger.debug("Error connecting to database", err))
    mainLogger.debug(`Server has been started on port ${config.PORT}`);
});
