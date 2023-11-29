require('dotenv').config()
const {app,express} = require('./app')
const {PORT} = process.env
const cors = require("cors")
const {otherError,notFoundError} = require('./middlewares/errorHandling.middleware')
const docsRoute = require('./routes/v1/docs.routes')
const authRoute = require('./routes/v1/auth.routes')
const coursesRoute = require('./routes/v1/course.routes')
const categoriesRoute = require('./routes/v1/category.routes')
const chaptersRoute = require('./routes/v1/chapters.routes')
const bodyParser = require('body-parser')




app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/',(req,res,next) => {
    try {
        res.json({
            success : true,
            message : "hello",
            data : "welcome to itSpace"
        })
    } catch (err) {
        next(err)
    }
})
app.use('/api/v1',docsRoute)
app.use('/api/v1/auth',authRoute)
app.use('/api/v1',coursesRoute)
app.use('/api/v1',categoriesRoute)
app.use('/api/v1',chaptersRoute)

/// error handling middleware
app.use(otherError)
app.use(notFoundError)

app.listen(PORT, () => console.log('listening to port',PORT))