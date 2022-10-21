const jwt = require('jsonwebtoken')
const User = require('../models/User')
module.exports = async function userAuth(req,res,next){
    try {
        const payload = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        // console.log(req.body)
        // console.log(payload)
        const user = await User.findById(payload._id)
        // console.log(user)
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        return res.json({
            error:error.message
        })
    }
    
}