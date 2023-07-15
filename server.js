const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = 8000;
const mongoose = require("mongoose");
const DB = process.env.DATABASE.replace(
  "<%PASSWORD%>",
  process.env.DB_PASSWORD
);

mongoose.connect(DB).then(() => {
  // console.log(con.connection)
  console.log("connected to database");
});

app.listen(port, () => {
  // console.log(database)
  console.log("Server start listening at http://localhost:8000");
});
