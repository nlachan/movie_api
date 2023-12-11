const express = require("express"),
  fs = require("fs"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  path = require("path");
const { title } = require("process");

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["Joker"],
  },
];

let movies = [
  {
    Title: "The Godfather",
    Yearrelease: "1972",
    Genre: {
      Name: "gangster",
    },
    Director: {
      Name: "Francis Ford Coppola",
    },
  },
  {
    Title: "The Godfather Part II",
    Yearrelease: "1974",
    Genre: {
      Name: "gangster",
    },
    Director: {
      Name: "Francis Ford Coppola",
    },
  },
  {
    Title: "The Boondock Saints",
    Yearrelease: "1999",
    Genre: {
      Name: "action",
    },
    Director: {
      Name: "Troy Duffy",
    },
  },
  {
    Title: "Joker",
    Yearrelease: "2019",
    Genre: {
      Name: "thriller",
    },
    Director: {
      Name: "Todd Phillips",
    },
  },
  {
    Title: "Scarface",
    Yearrelease: "1983",
    Genre: {
      Name: "gangster",
    },
    Director: {
      Name: "Brian De Palma",
    },
  },
  {
    Title: "Jurassic Park",
    Yearrelease: "1993",
    Genre: {
      Name: "science fiction action",
    },
    Director: {
      Name: "Steven Spielberg",
    },
  },
  {
    Title: "The Jungle Book",
    Yearrelease: "1967",
    Genre: {
      Name: "animation",
    },
    Director: {
      Name: "Wolfgang Reitherman",
    },
  },
  {
    Title: "Inception",
    Yearrelease: "2010",
    Genre: {
      Name: "science fiction action",
    },
    Director: {
      Name: "Christopher Nolan",
    },
  },
  {
    Title: "The Lion King",
    Yearrelease: "1994",
    Genre: {
      Name: "animation",
    },
    Director: {
      Name: "Rob Minkoff",
    },
  },
  {
    Title: "Deadpool",
    Yearrelease: "2016",
    Genre: {
      Name: "action",
    },
    Director: {
      Name: "Tim Miller",
    },
  },
];

const log = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.listen(8080, () => {
  console.log("Server listening on port 8080.");

  // CREATE
  app.post("/users", (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser);
    } else {
      res.status(400).send("users need names");
    }
  });

  // UPDATE
  app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find((user) => user.id == id);

    if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send("no such user");
    }
  });

  // CREATE
  app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
      user.favoriteMovies.push(movieTitle);
      res
        .status(200)
        .send("${movieTitle} has been added to user ${id}'s array");
    } else {
      res.status(400).send("no such user");
    }
  });

  // DELETE
  app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter(
        (title) => title !== movieTitle
      );
      res
        .status(200)
        .send("${movieTitle} has been removed from user ${id}'s array");
    } else {
      res.status(400).send("no such user");
    }
  });

  // DELETE
  app.delete("/users/:id", (req, res) => {
    const { id } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
      users = users.filter((user) => user.id != id);
      res.status(200).send("user ${id} has been deleted");
    } else {
      res.status(400).send("no such user");
    }
  });

  // Read
  app.get("/movies", (req, res) => {
    res.status(200).json(movies);
  });

  // READ
  app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = movies.find((movie) => movie.Title === title);

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send("no such movie");
    }
  });

  // Read
  app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send("no such genre");
    }
  });

  // Read
  app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(
      (movie) => movie.Director.Name === directorName
    ).Director;

    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).send("no such director");
    }
  });

  app.use(morgan("combined", { stream: log }));

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", { root: __dirname });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Server Error");
  });
});
