const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const errorHandler = require('./middlewares/errorHandler');


dotenv.config();
const api = process.env.API_URL;
const env = process.env.NODE_ENV;


app.use(
    bodyParser.json({
        verify: function (req, res, buf) {
            req.rawBody = buf;
        }
    }) 
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Récupérer la ou les origines CORS depuis les variables d'environnement.
// Si process.env.CORS_ORIGIN n'est pas défini, nous mettons une valeur par défaut pour le développement local.
// On divise la chaîne par des virgules pour gérer plusieurs origines si nécessaire.

const allowedOrigins =
    env === 'development'
        ? (process.env.CORS_ORIGIN_LOCAL
            ? process.env.CORS_ORIGIN_LOCAL.split(',')
            : ['http://localhost:3000', 'http://localhost:5000'])
        : (process.env.CORS_ORIGIN_ONLINE
            ? process.env.CORS_ORIGIN_ONLINE.split(',')
            : []);


//cors
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS A'));
        }
    },
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


app.use(errorHandler);

const mongoURL =
    env === 'development'
        ? process.env.MONGODB_URL_LOCAL
        : process.env.MONGODB_URL_ONLINE;

mongoose.set("strictQuery", false);
mongoose.connect(mongoURL).then(() => console.log('DBconnection succès!'))
    .catch((err) => {
        console.log(err);
    });

app.listen(process.env.PORT || 5000, () => {
    console.log(api);
    console.log('App listening on port http://localhost:5000');
});