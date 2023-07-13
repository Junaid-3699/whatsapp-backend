//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

//app config
const app = express()
const port = process.env.PORT ||9000

//middlewares
app.use(express.json())
app.use(cors())

//DB congig
const conn_URL = 'mongodb+srv://admin:admin@yt-whatsapp-backend.rrfurqp.mongodb.net/whatsappDB'
mongoose.connect(conn_URL, { useUnifiedTopology : true, useNewUrlParser : true})

const db = mongoose.connection;
db.once('open', ()=> {
    console.log("DB connected");
    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        // console.log(change);

        if(change.operationType == 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                recieved : messageDetails.recieved

            });
        } else {
            console.log("Error triggering Pusher");
        }
    })
})

//?????
const pusher = new Pusher({
    appId: "1633801",
    key: "a1e4137a046604cdf3dd",
    secret: "b230e75329df38db41a0",
    cluster: "ap2",
    useTLS: true
  });

//api endpoints
app.get('/', (req, res) => {
    res.status(200).send("Welcome 2 watsup")
})

app.get('/messages/sync' , (req, res) => {
    Messages.find()
        .then(data => res.status(200).send(data))
        .catch(err => res.status(500).send(err))
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body
    Messages.create(dbMessage)
        .then(data => res.status(201).send(data))
        .catch(err => res.status(500).send(err))
})

//listener
app.listen(port, () => console.log(`Server is up on port ${port}`))