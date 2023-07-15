const mongoose = require('mongoose');

const medSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'medicine should have name'],
        trim:true,
        unique:true
    },
    // ! this price is per tablet
    price:{
        type:Number,
        default:0,
        required:[true, "Medicine should have price"],
    },
    content:{
        type:[{String:Number}],// ! object of <name, amount in mg>
        require:true
    }
})