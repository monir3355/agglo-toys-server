const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztxo0js.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("aggloToys").collection("toys");

    // get all toys
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find({}).toArray();
      res.send(result);
    });
    // get single toy by id
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });
    // get all toys by email
    app.get("/myToys/:email", async (req, res) => {
      const result = await toyCollection
        .find({ seller_email: req.params.email })
        .toArray();
      res.send(result);
    });

    // get all toys by sub category
    app.get("/categoryToys/:subCategory", async (req, res) => {
      const result = await toyCollection
        .find({ sub_category: req.params.subCategory })
        .toArray();
      res.send(result);
    });

    // search by toy name
    app.get("/searchToys/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          toy_name: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // post toys
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });
    // Update toy
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          ...updatedToy,
        },
      };
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    });
    // delete toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use("/", (req, res) => {
  res.send("agglo toys server is running...");
});
app.listen(port, () => {
  console.log(`agglo toys server is running on port ${port}`);
});
