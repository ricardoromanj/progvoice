import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import twilio from 'twilio';
import request from 'request';
import rethinkdb from 'rethinkdb';
// import async from 'asyncawait/async';
// import await from 'asyncawait/await';

const app = express();
const server = http.Server(app);
const io = socketio(server);

const port = 8020;
let rethinkdbconn = null;

const setupDB = async () => {
  let rethinkdbconn = await rethinkdb.connect({host: 'localhost', port: 28015}, (err, conn) => {
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

});

app.post('/gatherreply', (req, res) => {

});

app.post('/sendreplyruby', (req, res) => {

});

app.post('/sendreplypython', (req, res) => {

});

app.post('/sendreplynode', (req, res) => {

});

// Websocket
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
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
      console.log('update-data', row);
      io.emit('update-data', {call: row.new_val});
    });
  });

  // Initialize server
  server.listen(port, () => {
    console.log(`Listening on port ${port}` );
  });
});
