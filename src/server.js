if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./apis/gerencianet');

const app = express();

app.use(bodyParser.json());

let reqGNAlready = GNRequest({
  clientID: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET
});

async function restartReqGN() {
  reqGNAlready = await GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
  });
}

setInterval(restartReqGN, 600000);

app.post('/cob', async (req, res) => {
  try {
    const reqGN = await reqGNAlready;
    const dataCob = req.body;
    const metadata = {
      notification_url: 'http://inscreveai.com.br/notification'
    };

    const body = {...dataCob, metadata}
    
    const bolResponse = await reqGN.post('/v1/charge/one-step', body);
  
    res.status(200).json({
      bolResponse: bolResponse.data,
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post('/notification', (req, res) => {
  console.log(req.body);

  //handlePixWebhook(req.body);

  res.send('200');
});

app.listen(9000, () => {
  console.log('running');
})
