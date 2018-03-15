import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import moment from 'moment';
import twilio from 'twilio';
import request from 'request';
import rethinkdb from 'rethinkdb';

const app = express();
const server = http.Server(app);
const io = socketio(server);
const VoiceResponse = twilio.twiml.VoiceResponse;

// Load environment variables
const port = process.env.PORT;
const pythonServerHost = process.env.PYTHON_SERVER_HOST;
const pythonServerPort = process.env.PYTHON_SERVER_PORT;
const rubyServerHost = process.env.RUBY_SERVER_HOST;
const rubyServerPort = process.env.RUBY_SERVER_PORT;
const rethinkdbHost = process.env.RETHINKDB_HOST;
const rethinkdbPort = process.env.RETHINKDB_PORT;
const utcOffset = process.env.UTC_OFFSET;

// Header constants
const HTTP_OK = 200;
const CONTENT_XML = { 'Content-Type': 'text/xml' };

let rethinkdbconn = null;

const setupDB = async () => {
  let rethinkdbconn = await rethinkdb.connect({host: rethinkdbHost, port: rethinkdbPort}, (err, conn) => {
    if (err) throw err;
    return conn;
  });
  let tableList = await rethinkdb.db('test').tableList().run(rethinkdbconn);
  if (tableList.indexOf("calls") < 0) {
    await rethinkdb.db('test').tableCreate('calls').run(rethinkdbconn, (err, result) => {
      if (err) throw err;
    });
  }
  return rethinkdbconn;
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('*', cors());

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// root
app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

// twilio endpoints
app.post('/answer', (req, res) => {
  const twiml = new VoiceResponse();
  let gather = twiml.gather({
    input: 'dtmf',
    action: '/gatherreply',
    numDigits: 1
  });

  gather.say('For Ruby, press 1. For Python, press 2. For Node, press 3.');
  twiml.redirect({
    method: 'POST'
  }, '/answer');

  res.writeHead(HTTP_OK, CONTENT_XML);
  res.end(twiml.toString());
});

app.post('/hangup', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.hangup();

  res.writeHead(HTTP_OK, CONTENT_XML);
  res.end(twiml.toString());
});

app.post('/gatherreply', (req, res) => {
  let prompt = 'Would you like to hear "hello", or, "good bye"? Please speak your answer.';
  let actionStr = '';
  let invalidInput = false;

  let paramDigit = req.body['Digits'];

  if (paramDigit != undefined) {
    if (paramDigit === '1') {
      actionStr = '/sendreplyruby';
    } else if (paramDigit === '2') {
      actionStr = '/sendreplypython';
    } else if (paramDigit === '3') {
      actionStr = '/sendreplynode';
    } else {
      invalidInput = true;
    }
  } else {
    invalidInput = true;
  }

  const twiml = new VoiceResponse();

  if (invalidInput) {
    prompt = 'Not a valid option.';

    twiml.say(prompt);
    twiml.redirect({
      method: 'POST'
    }, '/hangup');

  } else {
    let gather = twiml.gather({
      input: 'speech',
      timeout: 3,
      action: actionStr
    });
    gather.say(prompt);
    twiml.redirect({
      method: 'POST'
    }, '/hangup');
  }

  res.writeHead(HTTP_OK, CONTENT_XML);
  res.end(twiml.toString());
});

app.post('/sendreplyruby', (req, res) => {
  const twiml = new VoiceResponse();
  let reply = '';
  let replypath = '';
  let prompt = '';
  let speechResult = req.body['SpeechResult'];
  let invalidInput = false;

  if (speechResult.match(/hello/i)) {
    reply = 'hello';
  } else if (speechResult.match(/goodbye/i) || speechResult.match(/good bye/i)) {
    reply = 'goodbye';
  } else {
    reply = 'Invalid input.';
    prompt = reply;
    invalidInput = true;
  }

  if (!invalidInput) {
    let toNum = req.body['To'];
    let fromNum = req.body['From'];
    fromNum = fromNum.substr(fromNum.length - 2);
    let calledAt = moment().utcOffset(utcOffset).format('YYYY/MM/DD HH:MM:SS');

    request.get(`http://${rubyServerHost}:${rubyServerPort}/reply${reply}`, (err, httpResponse, body) => {
      if (err) {
        reply = 'There was an error.';
      } else {
        reply = body;

        rethinkdb.table('calls').insert(
          { 
            toNum: toNum,
            fromNum: fromNum,
            serviceName: 'Ruby',
            serviceReply: reply,
            calledAt: calledAt
          }
        ).run(rethinkdbconn, (err, result) => {
          if (err) throw err;
        });

      }
      prompt = reply;

      twiml.say(prompt);
      twiml.hangup();

      res.writeHead(HTTP_OK, CONTENT_XML);
      res.end(twiml.toString());

    });

  } else {
    twiml.say(prompt);
    twiml.hangup();

    res.writeHead(HTTP_OK, CONTENT_XML);
    res.end(twiml.toString());
  }
});

app.post('/sendreplypython', (req, res) => {
  const twiml = new VoiceResponse();
  let reply = '';
  let replypath = '';
  let prompt = '';
  let speechResult = req.body['SpeechResult'];
  let invalidInput = false;

  if (speechResult.match(/hello/i)) {
    reply = 'hello';
  } else if (speechResult.match(/goodbye/i) || speechResult.match(/good bye/i)) {
    reply = 'goodbye';
  } else {
    reply = 'Invalid input.';
    prompt = reply;
    invalidInput = true;
  }

  if (!invalidInput) {
    let toNum = req.body['To'];
    let fromNum = req.body['From'];
    fromNum = fromNum.substr(fromNum.length - 2);
    let calledAt = moment().utcOffset(utcOffset).format('YYYY/MM/DD HH:MM:SS');

    request.get(`http://${pythonServerHost}:${pythonServerPort}/reply${reply}`, (err, httpResponse, body) => {
      if (err) {
        reply = 'There was an error.';
      } else {
        reply = body;

        rethinkdb.table('calls').insert(
          { 
            toNum: toNum,
            fromNum: fromNum,
            serviceName: 'Python',
            serviceReply: reply,
            calledAt: calledAt
          }
        ).run(rethinkdbconn, (err, result) => {
          if (err) throw err;
        });

      }
      prompt = reply;

      twiml.say(prompt);
      twiml.hangup();

      res.writeHead(HTTP_OK, CONTENT_XML);
      res.end(twiml.toString());

    });

  } else {
    twiml.say(prompt);
    twiml.hangup();

    res.writeHead(HTTP_OK, CONTENT_XML);
    res.end(twiml.toString());
  }
});

app.post('/sendreplynode', (req, res) => {
  const twiml = new VoiceResponse();
  let prompt = '';
  let speechResult = req.body['SpeechResult'];
  let invalidInput = false;

  if (speechResult.match(/hello/i)) {
    prompt = 'Hello from Node.';
  } else if (speechResult.match(/goodbye/i) || speechResult.match(/good bye/i)) {
    prompt = 'Good bye from Node.';
  } else {
    prompt = 'Invalid input.';
    invalidInput = true;
  }


  if (!invalidInput) {
    let toNum = req.body['To'];
    let fromNum = req.body['From'];
    fromNum = fromNum.substr(fromNum.length - 2);
    let calledAt = moment().utcOffset(utcOffset).format('YYYY/MM/DD HH:MM:SS');

    rethinkdb.table('calls').insert(
      { 
        toNum: toNum,
        fromNum: fromNum,
        serviceName: 'Node',
        serviceReply: prompt,
        calledAt: calledAt
      }
    ).run(rethinkdbconn, (err, result) => {
      if (err) throw err;
    });
  }

  twiml.say(prompt);
  twiml.hangup();

  res.writeHead(HTTP_OK, CONTENT_XML);
  res.end(twiml.toString());
});

// Websocket
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  rethinkdb.table('calls').run(rethinkdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, result) => {
      if (err) throw err;
      console.log(`Loaded data for user ${socket.id}`);
      socket.emit('load-data', result);
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// Setup DB and Listen
setupDB().then((conn) => {
  console.log('Setting up DB Connection');

  /* Save connection */
  rethinkdbconn = conn;              

  /* Setup realtime feed to database */
  rethinkdb.table('calls').changes().run(rethinkdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.each((err, row) => {
      if (err) throw err;
      console.log('Pushing update to connected users');
      io.emit('update-data', {call: row.new_val});
    });
  });

  // Initialize server
  server.listen(port, () => {
    console.log(`Listening on port ${port}` );
  });
});
