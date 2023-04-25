const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require('http-errors')
const cookieParser = require("cookie-parser");
const cors = require('cors');

const  dev  = require("./config");
const connectDatabase = require("./config/db");
const userRouter = require("./routers/users");
const app = express();

 const PORT = dev.app.serverPort ;

 app.listen( PORT, async() => {
   console.log(`sserver is running at http://localhost:${PORT}`);
   await connectDatabase();
});

app.use(
   cors({
     origin: '*',
     credentials: true,
   })
 );


 app.use(morgan("dev"));
 app.use(cookieParser());
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/users' , userRouter )
 
 app.use((req, res, next) => {
   next(createError(404,'not found'));
 });

 app.use((err, req, res, next) => {
   res.status(err.status || 500).json({
      error: {
         status: err.status || 500,
         message: err.message,
      },
   });
 });