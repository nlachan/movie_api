const http = require("http");
const fs = require("fs");
// const { url } = require("inspector");

http
  .createServer((request, response) => {
    let url = new URL(request.url, `http://${request.headers.host}`);

    let filePath = "";

    if (url.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    fs.appendFile(
      "log.txt",
      `URL: ${request.url} \nTimestamp: ${new Date()} \n \n`,
      (err) => {
        if (err) {
          console.log("append error");
        } else {
          console.log("msg appended");
        }
      }
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end("Hello Movie Lover!");
    });
  })

  .listen(8080);

console.log("My test server is running on Port 8080.");
