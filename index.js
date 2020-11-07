const express = require('express');
const mongoose = require('mongoose');
const Pusher = require("pusher");
const cors = require("cors");
const Post = require('./models/post');
//app config
const app = express();
const port = process.env.PORT || 5000;
const pusher = new Pusher({
    appId: "1103556",
    key: "93f3d1bfddc5b499335b",
    secret: "70a000475807c8ec55ea",
    cluster: "ap2",
    useTLS: true
});

//middlewares
app.use(express.json());
app.use(cors());

//DB config
const uriString = require('./config/database').connectionString;
mongoose.connect(uriString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
    console.log('DB Connected');
});
const changeStream = mongoose.connection.collection('posts').watch();
changeStream.on('change', (change) => {
    console.log('chgStream Triggered change..');
    console.log(change);
    console.log('end of change');
    if (change.operationType === 'insert') {
        console.log('Triggering Pusher');
        const postDetails = change.fullDocument;
        pusher.trigger('posts', 'inserted', {
            user: postDetails.user,
            caption: postDetails.caption,
            image: postDetails.image
        })
    } else {
        console.log('Error triggering Pusher');
    }

})
//api routes 
app.get("/", (req, res) => res.status(200).send('<h1>Hello Anika</h1>'));
app.post('/upload', (req, res) => {
    const body = req.body;
    Post.create(body, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})
app.get('/posts', (req, res) => {
    Post.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})
//listen

app.listen(port, () => console.log(`Our Server Running At port${port}`));