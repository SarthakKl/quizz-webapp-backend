
const axios = require('axios').default


async function getQuestions(category, difficulty){
    console.log( category, difficulty)
    try{
        const response = await axios({
            method:'get',
            url:`https://opentdb.com/api.php`,
            params:{
                amount:10,
                category: category,
                difficulty:difficulty,
                type:'multiple'
            }
        })
        return response.data
    }
    catch(error){
        console.log(error)
        return {
            response_code:1,
            error:error
        }
    }
}

module.exports = getQuestions