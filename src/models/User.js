const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    quiz:String,
    verified:{type:Boolean, default:false}
})
schema.statics.findUser = async function(email, pass){
    const user = await User.findOne({email:email})

    if(user == null){
        return {error:'User not found'}
    }
    if(user.password != pass){
        return {error: "Password doesn't match"}
    }
    console.log(user)
    return {
        error:null,
        user
    }
}
schema.methods.getAuthToken = async function(){
    return token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET)
}
const User = mongoose.model('User', schema)

module.exports = User