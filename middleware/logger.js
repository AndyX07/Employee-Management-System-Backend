const {format} = require('date-fns');
const {v4: uuidv4} = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

async function logEvents(message, logFileName){
    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logTime = `${dateTime} ${uuidv4()}`;
    try{
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), `${logTime} ${message}\n`);
    }
    catch{
        console.log('Error writing to log file');
    }
}

function logger(req, res, next){
    logEvents(`${req.method} ${req.url}`, 'requests.log');
    console.log(`${req.method} ${req.url}`);
    next();
}
module.exports = {logger, logEvents}