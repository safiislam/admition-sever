const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.yrhbvyy.mongodb.net/?retryWrites=true&w=majority`;

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
    const collageCollection = client
      .db("collageCollection")
      .collection("collages");
    const admissionCollection = client
      .db("collageCollection")
      .collection("admission");
    const feedbackCollection = client
      .db("collageCollection")
      .collection("feedback");
    app.get("/collages", async (req, res) => {
      const result = await collageCollection.find().toArray();
      res.send(result);
    });
    app.get('/collagess/:id',async (req,res)=>{
      const id  = req.params
      console.log(id.id)
      const query = { collageId : JSON.parse(id.id) }
      const result = await collageCollection.findOne(query)
      res.send(result)
      console.log(result)
    })
    app.get('/collages/:text',async (req,res)=>{
      const text =req.params.text 
      console.log(text)
      const indexkey = {collegeName : 1}
      const indexOptions = { name:'collagename'}
      const result1 = await collageCollection.createIndex(indexkey,indexOptions)
      const result = await collageCollection.find(
        {
          $or:[
            {collegeName: {$regex : text , $options: 'i'}  }
          ]
        }
      ).toArray()
      res.send(result)
    })
    
    app.post("/admission", async (req, res) => {
      const bodyData = req.body;
      const result = await admissionCollection.insertOne(bodyData);
      res.send(result);
    });
    app.get("/myCollege", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const mycollages = await admissionCollection.findOne(query);
      const findCollage = await collageCollection.find().toArray()
      const isMatched = findCollage?.find(item=> item?.collageId === mycollages?.collageId )
      res.send(isMatched)
    });
    
    app.post('/feedback',async (req,res)=>{
      const feedback = req.body 
      const result = await feedbackCollection.insertOne(feedback)
      res.send(result)
    })
    app.get('/feedback',async(req,res)=>{
      const result = await feedbackCollection.find().toArray()
      res.send(result)
    })

    // await client.connect();
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

app.get("/", async (req, res) => {
  res.send("hello word");
});

app.listen(port);
