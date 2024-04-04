/**
 * The main entry point for the application.
 *
 * This script sets up an Express application, connects to MongoDB, defines API endpoints,
 * and includes configuration for CORS, logging, and authentication using Passport and JWT.
 */

const express = require("express");
const app = express();
const morgan = require("morgan"); // HTTP request logger middleware
const fs = require("fs");
const bodyParser = require("body-parser"); // Parse incoming request bodies in a middleware
const uuid = require("uuid"); // For generating unique identifiers
const path = require("path"); // Provides utilities for working with file and directory paths

const mongoose = require("mongoose"); // ODM library for MongoDB
const Models = require("./models.js"); // Import schemas and models

const Movie = Models.Movie; // Destructure Movie model
const User = Models.User; // Destructure User model

const bcrypt = require("bcrypt"); // Library for hashing passwords

const { check, validationResult } = require("express-validator"); // Validation and sanitization middleware

// mongoose connection
mongoose
  .connect(process.env.CONNECTION_URI) // Connection URI from environment variable
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS configuration
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://lachanmyflix.netlify.app",
];

//allow specific set of origins to access your API
app.use(
  cors({
    origin: (origin, callback) => {
      // Check if origin is allowed
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Passport.js authentication
let auth = require("./auth")(app); // Import and initialize authentication module
const passport = require("passport");
require("./passport"); // Passport strategies

// log all requests
app.use(morgan("common"));

// Define the endpoint for '/'
app.get("/", (req, res) => {
  // Send the index.html file
  res.send("Welcome to my movie page!");
});

// READ user list
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ movie list
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Fetch all movies
      const movies = await Movies.find();

      // Send the list of movies in the response
      res.status(200).json(movies);
    } catch (error) {
      // Handle any errors that occur during the operation
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

//READ movie list by movie title
app.get(
  "/movies/:title/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Query the database to find the movie by title
      const movie = await Movies.findOne({ title: req.params.title });

      // If the movie is found, send its data in the response
      if (movie) {
        res.status(200).json(movie);
      } else {
        // If the movie is not found, send a 404 Not Found response
        res.status(404).send("Movie not found");
      }
    } catch (error) {
      // Handle any errors that occur during the operation
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

//READ genre by name
app.get(
  "/genres/:name/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Query the database to find a movie with the specified genre
      const movie = await Movies.findOne({ "genres.name": req.params.name });

      // If the movie is found, find the genre with the specified name
      if (movie) {
        const genre = movie.genres.find((genre) => {
          return genre.name.toLowerCase() === req.params.name.toLowerCase();
        });

        // If the genre is found, send its description in the response
        if (genre) {
          res.status(200).json({ description: genre.description });
        } else {
          // If the genre is not found, send a 404 Not Found response
          res.status(404).send("Genre not found.");
        }
      } else {
        // If the movie is not found, send a 404 Not Found response
        res.status(404).send("Movie not found.");
      }
    } catch (error) {
      // Handle any errors that occur during the operation
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

// READ director by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Query the database to find a movie with the specified director
      const movie = await Movies.findOne({ "director.name": req.params.name });

      // If the movie is found, send the director's information in the response
      if (movie) {
        res.status(200).json(movie.director);
      } else {
        // If the movie is not found, send a 404 Not Found response
        res.status(404).send("Director not found.");
      }
    } catch (error) {
      // Handle any errors that occur during the operation
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

//CREATE a New user
app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check(
      "Username",
      "Username is required to have at least 5 characters"
    ).isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],

  async (req, res) => {
    console.log("Username" + JSON.stringify(req.body));
    //check the validation object for errorss
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("422 error" + JSON.stringify(errors));
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      //Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//UPDATE User's info
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete a user by username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// DELETE favorite movie for user
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

// listen for request
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("listening on port" + port);
});

// MongoDB connection error handling
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
