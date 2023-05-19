require('dotenv').config();
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000;
const path = require('path')
const {logger} = require('./middleware/logger.js');
const cors = require('cors');
const corsOptions = require('./config/corsOptions.js');
const connect = require('./models/connect.js');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const {logEvents} = require('./middleware/logger.js');

connect();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger);
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/',require('./routes/root.js'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/comments', require('./routes/commentRoutes'));
app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
        return;
    }
    else if(req.accepts('json')) {
        res.json({error: 'Not found'});
        return;
    }
    else{
        res.type('txt').send('Not found');
    }
});

mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Running on port ${PORT}!`));
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});