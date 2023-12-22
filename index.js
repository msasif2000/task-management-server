const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


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
const tasksCollection = client.db("taskManagementDB").collection("tasks");
const ongoingTasksCollection = client.db("taskManagementDB").collection("ongoingTasks");
const prevTasksCollection = client.db("taskManagementDB").collection("prevTasks");

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

app.get('/user/:email', async(req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const result = await userCollection.findOne(query);
    res.send(result);
})


app.get('/usersLogin', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await userCollection.findOne(query);
    res.send(result);
});

app.post('/createTask',  async(req, res) => {
    const task = req.body;
    const result = await tasksCollection.insertOne(task);
    res.send(result);
})

app.get('/myTasks/:email', async(req, res)=> 
{
    const email = req.params.email;
    const query = { email: email};
    const result = await tasksCollection.find(query).toArray();
    res.send(result);
})

app.delete('/deleteTask/:id', async(req, res)=> 
{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await tasksCollection.deleteOne(query);
    res.send(result);
})
app.get('/myTask/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await tasksCollection.findOne(query);
    res.send(result);
})

app.put('/updateTask/:id', async(req, res) => {
    const id = req.params.id;
    const task = req.body;
    const query = { _id: new ObjectId(id)};
    const updateDoc = {
        $set: {
            title: task.title,
            deadline: task.deadline,
            priority: task.priority,
            details: task.details,
        },
    };
    const result = await tasksCollection.updateOne(query, updateDoc);
    res.send(result);
})

app.post('/ongoingTask',  async(req, res) => {
    const task = req.body;
    const result = await ongoingTasksCollection.insertOne(task);
    res.send(result);
})

app.get('/ongoingTasks/:email', async(req, res)=>
{
    const email = req.params.email;
    const query = { email: email};
    const result = await ongoingTasksCollection.find(query).toArray();
    res.send(result);
})

app.get('/myOngoingTask/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: id};
    const result = await ongoingTasksCollection.findOne(query);
    res.send(result);
})

app.delete('/deleteOngoingTask/:id', async(req, res)=>{
    const id = req.params.id;
    const query = { _id: id};
    const result = await ongoingTasksCollection.deleteOne(query);
    res.send(result);
})

app.post('/prevTask',  async(req, res) => {
    const task = req.body;
    const result = await prevTasksCollection.insertOne(task);
    res.send(result);
})

app.get('/prevTasks/:email', async(req, res)=>{
    const email = req.params.email;
    const query = { email: email};
    const result = await prevTasksCollection.find(query).toArray();
    res.send(result);
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});