const { errorHandler, notFound } = require("./configs/errorHandler.config");
const connectToDatabase = require("./configs/dbConnect.config");
const path = require('path');

//dotenv config
require("dotenv").config();

//importing routers
const userRouter = require("./routers/user.router");
const movieRouter = require("./routers/movie.router");
const ticketRouter = require("./routers/ticket.router");
const scheduleRouter = require("./routers/schedule.router");
const analyticsRouter = require("./routers/analytics.router");

//Importing parsers
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

//Parsers
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

//serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static('/uploads'));

// Define the directory where your static files (including HTML) are located
app.use(express.static(path.join(__dirname, 'public')));

//API connections
app.use("/api/v1/user", userRouter);
app.use("/api/v1/movie", movieRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/analytics", analyticsRouter);

//Error handler and not found handler
app.use(errorHandler);
app.use(notFound);

//Connecting to database
connectToDatabase();

app.get("/", (req, res) => {
  res.send("Welcome to the backend :)");
});


// app.get('/uploads/:filename', (req, res) => {
//   res.sendFile(path.join(__dirname + '/uploads/' + req.params.filename));
// });

//Listening on a specified port
app.listen(process.env.PORT, () => {
  console.log(
    `App listening on port ${process.env.PORT} ==> http://localhost:${process.env.PORT}`
  );
});
