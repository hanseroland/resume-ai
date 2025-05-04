const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const api = process.env.API_URL;

app.use(
    bodyParser.json({
        verify: function(req, res, buf) {
            req.rawBody = buf;
        }
    })
); 

app.use(express.urlencoded({ extended: true }));
//cors
app.use(cors({
    origin: true,
    credentials: true,
    methods: "GET,PUT,DELETE,POST,PATCH"
}));

app.use('/public/profile', express.static(__dirname + '/public/profile'));


//routes
const usersRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const resumeRouter = require('./routes/resumeRoutes');



 
// http://localhost:5000/api/v1/ 
app.use(`${api}/auth`, authRouter); 
app.use(`${api}/users`, usersRouter); 
app.use(`${api}/resumes`, resumeRouter); 






mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL_ONLINE)
    .then(() => console.log('DBconnection succès!'))//message à afficher si mongoDB fonctionne normalement
    .catch((err) => {
        console.log(err);
});

app.listen(process.env.PORT || 5000, () => {
    console.log(api);
    console.log('App listening on port http://localhost:5000');
});