const Questions = require("../models/Questions")
const User = require("../models/User")
const shuffle = require("../utils/shuffle")
const getQuestions = require("../utils/triviaApi")

exports.updateHandler = async (req, res) => {
    try {
        const option = req.body.optionSelected
        const questionId = req.body.questionId
        const quizId = req.body.quizId
        const hasEnded = req.body.hasEnded
        const uId = req.user._id

        // console.log(option, questionId, quizId, hasEnded)

        if (hasEnded) {
            await Questions.updateOne({ _id: quizId, 'questions._id': questionId }, 
                                      { $set: {'has_ended': true, 'questions.$.selected_option': option}})
            
            await User.updateOne({'_id':uId}, {$set:{'quiz':''}})
            const quiz = await Questions.findOne({ _id: quizId })
            const questions = quiz.questions

            let score = 0
            for (let i = 0; i < 10; i++) {
                if (questions[i].selected_option == questions[i].correct_option) {
                    score += 1;
                }
            }
            return res.json({
                questions: questions,
                score: score,
                error: null
            })
        }
        const ques = await Questions.updateOne({ _id: quizId, 'questions._id': questionId },
            { $set: { 'questions.$.selected_option': option }})
        console.log(option, ques)

        return res.json({
            error: null,
            ques
        })

    } catch (error) {
        console.log(error)
        return res.json({
            error: error
        })
    }
}

exports.fetchQuestionHandler = async (req, res) => {
    try {
        const catIndex = req.query.index
        const category = req.query.category
        const difficulty = req.query.difficulty
        const uId = req.user._id

        //Checking quiz in database
        {
            const questions = await Questions.findOne({user_id: uId, cat_index: catIndex, difficulty: difficulty })

            // console.log(questions)
            if (questions != null) {
                const currTime = Date.now()
                if (currTime < questions.end_time && !questions.has_ended) {
                    questions.questions =  questions.questions.map((z) => {
                        delete z._doc.correct_option
                        return z
                    })
                    return res.json({
                        questions,
                        error: null
                    })
                }
                if (currTime >= questions.end_time || questions.has_ended) {
                    await Questions.deleteOne({ user_id: uId, cat_index: catIndex, difficulty: difficulty })
                }
            }
            console.log("Didn't find any quiz")
        }
        //Fetching quiz from trivia
        const data = await getQuestions(catIndex, difficulty)

        if (data.response_code != 0) {
            return {
                error: 'Unable to fetch questions'
            }
        }
        console.log(data)
        const quesArr = []

        for (let i = 0; i < 10; i++) {
            const obj = new Object()
            obj.question = data.results[i].question
            obj.question.replaceAll('&quot;', '')
            const options = [data.results[i].incorrect_answers[0], data.results[i].incorrect_answers[1],
            data.results[i].incorrect_answers[2], data.results[i].correct_answer]

            shuffle(options)

            obj.option1 = options[0]
            obj.option2 = options[1]
            obj.option3 = options[2]
            obj.option4 = options[3]
            obj.correct_option = data.results[i].correct_answer
            obj.selected_option = null
            quesArr.push(obj)
        }

        const startTime = Date.now()
        const endTime = startTime + (10 * 60 * 1000)

        // console.log(quesArr)
        const questions = new Questions({
            user_id: uId,
            start_time: startTime,
            end_time: endTime,
            has_ended: false,
            cat_index: catIndex,
            category: category,
            difficulty: difficulty,
            questions: quesArr
        })

        await questions.save()
        questions.questions = questions.questions.map((z) => {
            delete z._doc.correct_option
            return z
        })

        console.log(questions)
        res.json({
            questions,
            error: null
        })
        await User.updateOne({_id:uId}, {$set:{'quiz':questions._id}})
    } 
    catch (error) {
        return res.json({
            error: error.message
        })
    }
}