const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//midleware
app.use(cors())
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@emajohncluster.xb5sz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    client.connect();
    const inventoryCollection = client.db('wareHouse').collection('product');

}
run().catch(console.dir);

app.get('', (req, res) => {
    res.send('running');
})

app.listen(port, () => {
    console.log('listening port', port);
})