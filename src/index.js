const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3333;
const url =
  "mongodb://admin:admin@basecluster-shard-00-00.hirbx.mongodb.net:27017,basecluster-shard-00-01.hirbx.mongodb.net:27017,basecluster-shard-00-02.hirbx.mongodb.net:27017/produtosDB?ssl=true&replicaSet=atlas-12fzsk-shard-0&authSource=admin&retryWrites=true&w=majority";
const productsRouter = require("./routes/productsRoutes");

mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;
app.use(express.json());

app.use("/products", productsRouter);

try {
  con.on("open", () => {
    console.log("connected to mongoDB");
  });
} catch (error) {
  console.log("Error: " + error);
}
app.get("/", (req, res) => {
  res.send("Get");
});
app.post("/", (req, res) => {
  res.send("Post");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
