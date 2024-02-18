const jwt = require("jsonwebtoken");
const passport = require("passport");

require("./passport"); // Your local passport file

const jwtSecret = "your_jwt_secret"; // Load JWT secret from environment variable

const generateJWTToken = (user) => {
  // Sign only necessary user data (e.g., username or user ID)
  const payload = {
    username: user.Username,
    // You can add more fields as needed
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "7d", // Token expiration set to 7 days
    algorithm: "HS256", // HS256 algorithm
  });
};

module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        // Provide specific error message or code for authentication failures
        return res.status(401).json({
          message: "Authentication failed.error " + error + " user " + user,
          error: error || "Invalid credentials",
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).json({ message: "Internal server error" });
        }
        const token = generateJWTToken(user);
        return res.json({ user, token });
      });
    })(req, res);
  });
};
