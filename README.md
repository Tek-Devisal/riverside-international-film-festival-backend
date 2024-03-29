# Riverside International Film Festival Backend

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing Dependencies](#installing-dependencies)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Built With](#built-with)
- [License](#license)

## Getting Started

## Summary
This backend contains the feature where i can uplaod a movie, and add tickets for that movie and add a schedule for the movie also. 
The users can in turn pay for the ticket per movie. 

### Prerequisites

- [Node.js](https://nodejs.org/) (>=12.0.0)
- [npm](https://www.npmjs.com/) (>=6.0.0)
- [MongoDB](https://www.mongodb.com/) (Make sure MongoDB is installed and runnning)

### Installing Dependencies

```bash
npm install
```

### Setting Up Environment Variables

Create a `.env` file in the root of the project and add the below necessary environment variables.

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/your-database
SMTP_HOST = "smtp.example.com"
SMTP_PORT = 587
SMTP_SECURE = "TLS"
SMTP_SERVICE = "your_email_server"
SMTP_MAIL = "your_email@example.com"
SMTP_PASSWORD = "your_email_password"
JWT_SECRET = "your_jwt_secret_key"
```

## Running the Application

```bash
npm run dev
```

The server will be running at `http://localhost:3001` by default.

## API Endpoints

## Built With

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
