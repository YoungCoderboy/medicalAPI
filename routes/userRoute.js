const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    res.status(200).json({
        status: 'success',
        message: 'your code is working fine'
    })
})

module.exports = router