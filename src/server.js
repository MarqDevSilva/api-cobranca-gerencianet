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

app.post('/cob/link', async (req, res) => {
  try{
    const body = req.body
    const charge = await reqGN.post('/v1/charge', body);

    const charge_id = charge.data.charge_id;
    const link = await reqGN.post(`/v1/charge/${charge_id}/link`)

    const metadata = {
      notification_url: 'http://inscreveai.com.br/notification',
    };

    const notification = await reqGN.put(`/v1/charge/${charge_id}/metadata`, metadata)

    res.status(200).json({
      response: link.data
    })

    console.log(notification.data);
  }
  catch{
    console.log(error)
    res.status(500).json({ error: "Erro interno do servidor" });
  }
})

app.post('/cob/:id', async (req, res) => {
  try {
    const reqGN = await reqGNAlready;
    const body = req.body;
    
    const id = req.params.id;

    const Response = await reqGN.post(`/v1/charge/${id}/retry`, body);
  
    res.status(200).json({
      response: Response.data,
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post('/notification', async (req, res) => {
  try{
    const reqGN = await reqGNAlready;

    const { notification } = req.body;

    console.log('TOKEN:', req.body)

    const response = await reqGN.get(`/v1/notification/${notification}`);
    
    const { data } = response.data

    if(data){
      await updateStatus(data);
    }

    res.sendStatus(200);
  }catch (error){
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(9000, () => {
  console.log('running');
})
