'use strict'

const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 30
    },
    username: {
        type: String,
        required: true,
        max: 30
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        max: 20,
    },
    role: {
        type: String,
        default: "mvv",
        enum: ["mvv", "ccv", "svf", "ia"]
    },
}, { timestamps: true })

module.exports = model("User", userSchema);