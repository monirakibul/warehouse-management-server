const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;


//midleware
app.use(cors())
app.use(express.json());


function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@emajohncluster.xb5sz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('wareHouse').collection('item');
        const blogsCollection = client.db('wareHouse').collection('blogs');
        console.log('connected');

        // auth 

        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken })
        })


        // get all inventory 
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query);
            products = await cursor.toArray();
            res.send(products)

        });

        // get my items
        app.get('/my-items', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email.toLocaleLowerCase();
            const email = req.query.email.toLocaleLowerCase();
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = inventoryCollection.find(query);
                products = await cursor.toArray();
                res.send(products)
            }
            else {
                res.status(403).send({ message: 'Forbidden access' })
            }
        });

        // add inventory 
        app.post('/add-item', async (req, res) => {
            const newItem = req.body;
            const result = await inventoryCollection.insertOne(newItem);
            res.send(result);
        });

        // get inventory by id 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.findOne(query);
            res.send(result);
        });

        // update data
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            let { quantity } = req.body;
            if (quantity < 1) {
                quantity = 0
            }
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: quantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        })

        // delete by id
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });

        // get blogs 
        app.get('/blogs', async (req, res) => {
            const query = {};
            const cursor = blogsCollection.find(query);
            const blogs = await cursor.toArray();
            res.send(blogs)
        });

    }
    finally { }
}
run().catch(console.dir);

client.connect(err => {

});

app.get('', (req, res) => {
    res.send('running');
})

app.listen(port, () => {
    console.log('listening port', port);
})