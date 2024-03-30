const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
    birthYear: String,
    deathYear: String,
  },
  ImagePath: {
    Name: String,
  },
  Featured: {
    Boolean,
  },
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, require: true },
  Birthday: { type: Date, required: true },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "movies" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movies", movieSchema);
let User = mongoose.model("Users", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
