const dotenv = require('dotenv');
dotenv.config({path: './config.env'})
const express = require('express');
const app =express();


const medRoute = require('./routes/medRoute');
app.use('/api/v1/medicine',medRoute);


app.listen(process.env.PORT,()=>{
    console.log("Server start listning on port :"+ process.env.PORT);
})