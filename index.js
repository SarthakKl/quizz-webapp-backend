import { connect as _connect } from 'mongoose'
import { config } from 'dotenv'
import express, { json } from 'express'
import cors from 'cors'
const app = express()
import userAuth from './src/middlewares/userAuth'
import { loginHandler, signupHandler, incompleteQuiz, deleteIncompleteQuiz } from './src/controllers/userController'
import { updateHandler, fetchQuestionHandler } from './src/controllers/quizController'
// const { default: Question } = require('../client/src/components/Question')

app.use(cors())
config()
app.use(json())


const port = process.env.PORT || 3002

const connect = async () => {
    try {
        await _connect(process.env.MONGODB_URI, {
            
        })
        console.log('Connected with database')
    } catch (error) {
        console.log(error.message)
    }
}
connect()
app.get('/', (req, res) => {
    res.json({"message":"Yolo here I come"})
})
app.post('/Login', loginHandler)
app.post('/Signup', signupHandler)
app.patch('/update-selection', userAuth, updateHandler)
app.get('/fetchQuestion', userAuth, fetchQuestionHandler)
app.get('/incomplete-quiz-lookup', userAuth, incompleteQuiz)
app.patch('/delete-incomplete-quiz', userAuth, deleteIncompleteQuiz)

app.listen(port, () => {
    console.log(`Server started at ${port}`)
})