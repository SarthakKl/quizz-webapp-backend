const mongoose = require('mongoose')
const env = require('dotenv')
const express = require('express')
const cors = require('cors')
const app = express()
const userAuth = require('./src/middlewares/userAuth')
const userController = require('./src/controllers/userController')
const quizController = require('./src/controllers/quizController')
// const { default: Question } = require('../client/src/components/Question')

app.use(cors())
env.config()
app.use(express.json())


const port = process.env.PORT || 3002

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            
        })
        console.log('Connected with database')
    } catch (error) {
        console.log(error.message)
    }
}
connect()
app.post('/Login', userController.loginHandler)
app.post('/Signup', userController.signupHandler)
app.patch('/update-selection', userAuth, quizController.updateHandler)
app.get('/fetchQuestion', userAuth, quizController.fetchQuestionHandler)
app.get('/incomplete-quiz-lookup', userAuth, userController.incompleteQuiz)
app.patch('/delete-incomplete-quiz', userAuth, userController.deleteIncompleteQuiz)

app.listen(port, () => {
    console.log(`Server started at ${port}`)
})