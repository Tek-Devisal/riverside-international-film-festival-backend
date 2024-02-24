const { errorHandler, notFound } = require("./configs/errorHandler.config");
const connectToDatabase = require("./configs/dbConnect.config");

//dotenv config
require("dotenv").config();

//importing routers
const userRouter = require("./routers/user.router");
const movieRouter = require("./routers/movie.router");
const ticketRouter = require("./routers/ticket.router");
const scheduleRouter = require("./routers/schedule.router");

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

//API connections
app.use("/api/v1/user", userRouter);
app.use("/api/v1/movie", movieRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/schedule", scheduleRouter);

//Error handler and not found handler
app.use(errorHandler);
app.use(notFound);

//Connecting to database
connectToDatabase();

app.get("/", (req, res) => {
  res.send("Welcome to the backend :)");
});

//Listening on a specified port
app.listen(process.env.PORT, () => {
  console.log(
    `App listening on port ${process.env.PORT} ==> http://localhost:${process.env.PORT}`
  );
});
