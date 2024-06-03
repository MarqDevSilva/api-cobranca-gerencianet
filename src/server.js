if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./apis/gerencianet');
const { updateStatus } = require('./apis/notification');

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/notification', async (req, res) => {
  try{
    const reqGN = await reqGNAlready;

    const { notification } = req.body;

    const response = await reqGN.get(`/v1/notification/${notification}`);

    console.log(response)
    
    const { data } = response.data

    if(data){
      await updateStatus(data);
    }

    res.sendStatus(200);
  }catch (error){
    res.status(500).json({ error: error });
  }
});

app.listen(9000, () => {
  console.log('running');
})
