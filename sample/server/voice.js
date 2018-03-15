import express from 'express';
import twilio from 'twilio';

import settings from '@/config/settings';
import logger from '@/config/logger';

const VoiceResponse = twilio.twiml.VoiceResponse;

var router = express.Router();

router.get('/testvoice', (req, res) => {
  logger.info(req);

  const twiml = new VoiceResponse();
  var gather = twiml.gather({
    input: 'speech',
    action: '/complete'
  });

  gather.say('Please tell us why you are calling.');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());

});

router.post('/complete', (req, res) => {
  logger.info(req);
  const twiml = new VoiceResponse();

  twiml.say('Transaction completed.');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

module.exports = router;
