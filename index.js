const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//middlewares
const verifyToken = (req, res, next) => {
    console.log('verify token', req.headers.authorization);
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request');
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized request');
        }
        req.decoded = decoded;
        next();
    })
    //next();
}

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.alzohbu.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
    try {
        client.connect()
        console.log('TASK MANAGEMENT DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()


const userCollection = client.db("taskManagementDB").collection("users");


app.get('/', (req, res) => {
    res.send('TASK MANAGEMENT WEBSITE!');
});

app.post('/users',  async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
        return res.send({ message: 'User already exists' });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
})

app.get('/users', verifyToken, async (req, res) => {
    const result = await userCollection.find({}).toArray();
    res.send(result);
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});