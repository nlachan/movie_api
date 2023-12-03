const express = require("express"),
  fs = require("fs"),
  morgan = require("morgan"),
  path = require("path");

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let topTenMovies = [
  {
    title: "The Godfather",
    Director: "Francis Ford Coppola",
  },
  {
    title: "The Godfather Part II",
    Director: "Francis Ford Coppola",
  },
  {
    title: "The Boondock Saints",
    Director: "Troy Duffy",
  },
  {
    title: "Joker",
    Director: "Todd Phillips",
  },
  {
    title: "Scarface",
    Director: "Brian De Palma",
  },
  {
    title: "Jurassic Park",
    Director: "Steven Spielberg",
  },
  {
    title: "The Jungle Book",
    Director: "Wolfgang Reitherman",
  },
  {
    title: "Inception",
    Director: "Christopher Nolan",
  },
  {
    title: "The Lion King",
    Director: "Rob Minkoff",
  },
  {
    title: "Deadpool",
    Director: "Tim Miller",
  },
];
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));

app.get("/movies", (req, res) => {
  res.json(topTenMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to Movie Flix");
});

// set up error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke!");
});

app.listen(8080, () => {
  console.log("The movie app has loaded and is listening on port 8080");
});
