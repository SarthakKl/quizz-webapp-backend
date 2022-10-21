const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    start_time:Date,
    end_time:Date,
    has_ended: Boolean,
    cat_index:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    difficulty: {
        type:String,
        required:true
    },
    questions:[{
        question:{
            type:String,
            required:true
        },
        option1:{
            type:String,
            required:true
        },
        option2:{
            type:String,
            required:true
        },
        option3:{
            type:String,
            required:true
        },
        option4:{
            type:String,
            required:true
        },
        correct_option:{
            type:String,
            required:true
        },
        selected_option: String
    }]

})
const Questions = mongoose.model('Question', schema)

module.exports = Questions