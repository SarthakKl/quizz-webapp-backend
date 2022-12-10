const Questions = require("../models/Questions")
const User = require("../models/User")
const sendEmail  = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')


const helper = async (userId, email) => {
    try {
        const token = jwt.sign({_id:userId}, process.env.JWT_SECRET, {expiresIn: 1 * 60})
        
        const url = `${process.env.BASE_URL}${userId}/Login/verify/${token}`
        const mailResponse = await sendEmail(email, 'Email Verification', url);
        
        return {mailResponse:mailResponse, error:mailResponse?.error||null}
    } catch (error) {
        console.log(error)
        return {error:error.message}
    }
}
exports.loginHandler = async (req, res) => {
    try {
        const response = await User.findUser(req.body.email, req.body.password)
        if (response.error != null) {
            return res.json({
                error: response.error
            })
        }
        const user = response.user
        if(!user.verified){
            const mailResponse = await helper(user._id, user.email)
            if(mailResponse?.error){
                console.log(mailResponse)
                return res.status(500).json({
                    error:mailResponse.error
                })
            }
            return res.status(200).json({
                message:"not verified", 
                error:null
            })
        }
        const token = await user.getAuthToken()
        console.log(user, token)
        return res.json({
            message:'Logged in',
            error: null,
            token, user
        })
    }
    catch (error) {
        console.log(error)
        return res.json({error})
    }
}

exports.signupHandler = async (req, res) => {
    try {
        console.log('SignUp started')
        const user = new User({email: req.body.email, password: req.body.password, quiz:null}) 
        await user.save()

        const mailResponse = await helper(user._id, user.email)
   
        if(mailResponse?.error){
            console.log(mailResponse)
            return res.status(500).json({
                error:mailResponse.error
            })
        }
        res.status(200).json(
            {
                message:"A mail sent to your email. Please verify!!",
                error:null
            }
        )
        
    } catch (error) {
        if(error.message.includes("email_1 dup key")){
            return res.json({
                error:'Email already registered'
            })
        }
        console.log(error)
        res.json({
            error:error.message
        })
    }
}
exports.emailVerificationHandler = async (req, res) => {
    try {
        //Will receive a unique String and I need to validate whether there is a 
        //token that exists for that unique string.
        const token = req.query.token
        const userId = req.query.user_id
        if(token){
            jwt.verify(token,process.env.JWT_SECRET,async (err, valid)=>{
                if(err){
                   return res.status(400).json({
                      message:'Verification link expired',
                   })
                }
                else{
                    const user = await User.findOne({_id:userId})
                    // console.log(user)
                    const newToken = await user.getAuthToken()
                    if(user.verified){
                        return res.status(200).json({
                            message:"You are alread verifed. Redirecting....",
                            newToken
                        })
                    }
                    await User.updateOne({_id:userId}, {$set:{verified:true}})
                    console.log(user)
                    // const userId = await User.updateOne({})
                    console.log(newToken)
                    return res.status(200).json({
                        message:"Your email address has been verified. Redirecting....", 
                        newToken
                    })
                }
            })
        }
        else{
            return res.status(400).json({
                message:'Invalid email verification link',
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Interval server error occured'})
    }
}
exports.reverifyEmail = async (req, res) => {
    try {
        console.log('reverifying email')
        const userId = req.query.userId
        const user = await User.find({_id:userId})
        // console.log(user[0].email)
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        // const token = jwt.sign({_id:userId}, process.env.JWT_SECRET, {expiresIn:1*60})

        // const url = `${process.env.BASE_URL}${userId}/Login/verify/${token}`
        // const email = await sendEmail(user[0].email, 'Email Verification', url);

        const mailResponse = await helper(userId, user[0].email)
   
        if(mailResponse?.error){
            console.log(mailResponse)
            return res.status(500).json({
                error:mailResponse.error
            })
        }
        // if(email?.error){
        //     console.log(email)
        //     return res.status(500).json({
        //         message:email.error
        //     })
        // }
        res.status(200).json(
            {
                message:"A mail sent to your email. Please verify!!",
            }
        )
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:error.message
        })
    }
}
exports.incompleteQuiz = async (req, res) => {
    try {
        const uId = req.user._id

        const user = await User.findOne({'_id':uId})
        if(!user.quiz){
            return res.json({
                quiz_details:null, 
                error:null
            })
        }
        const quiz = await Questions.findOne({'_id':user.quiz})
        const currentTime = Date.now()
        if(quiz.end_time - currentTime > 10000){
            console.log(quiz)
            return res.json({ 
                quiz_details: {
                    _id:quiz._id,
                    category: quiz.category,
                    difficulty: quiz.difficulty,
                    cat_index: quiz.cat_index
                },
                error:null
            })
        }
        await User.updateOne({'_id':uId}, {$set:{'quiz':''}})
        await Questions.deleteOne({'_id': user.quiz})
        return res.json({
            quiz_details:null,
            error:null
        })
    } catch (error) {
        console.log(error)
        return res.json({error})
    }
}
exports.deleteIncompleteQuiz = async (req, res) => {
    try {
        const uId = req.user._id
        const quizId = req.body.quizId
        // console.log(quizId)
        await User.updateOne({_id:uId}, {$set:{quiz:''}})
        await Questions.deleteOne({_id:quizId}) 
     
        return res.json({
            error:null
        })
    } catch (error) {
        console.log(error)
        return res.json({error})
    }
}

