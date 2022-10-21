const Questions = require("../models/Questions")
const User = require("../models/User")

exports.loginHandler = async (req, res) => {
    try {
        const response = await User.findUser(req.body.email, req.body.password)
        if (response.error != null) {
            return res.json({
                error: response.error
            })
        }
        const user = response.user
        const token = await user.getAuthToken()

        return res.json({
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
        const user = new User({email: req.body.email, password: req.body.password, quiz:null}) 
        await user.save()

        try {
            const token = await user.getAuthToken()
            res.json(
                {
                    message:"Update loging details",
                    user,
                    token
                }
            )
        } catch (error) {
            return res.json({
                error:"Unable to create token"
            })  
        }
    } catch (error) {
        if(error.message.includes("email_1 dup key")){
            return res.json({
                error:'Email already registered'
            })
        }
        res.json({
            error:error.message
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

