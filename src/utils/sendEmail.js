const nodemailer = require('nodemailer')

module.exports = async(email, subject, text) => {
    try {
        console.log("Trying to send email")
        const transporter = nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.SERVICE,
            port:Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.SECURE),
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })
        const emailOptions = {
            from:process.env.USER,
            to:email,
            subject:subject,
            text:text
        }
        transporter.sendMail(emailOptions, function(error, response){
            if(error){
                console.log(error)
                return {error}
            }
            else{
                return {response}
            }
        })
    } catch (error) {
        console.log("Email not sent")
        return {error}
    }
}