const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const authenticate = ({ clientID, clientSecret }) => {
  const credentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString('base64');

  return axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT_COB}/v1/authorize`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    data: {
      grant_type: 'client_credentials'
    }
  });
};


const GNRequest = async (credentials) => {
  const authResponse = await authenticate(credentials);
  const accessToken = authResponse.data.access_token;
  console.log('AcessToken: ', accessToken)
  return axios.create({
    baseURL: 'http://cobrancas.api.efipay.com.br',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

module.exports = GNRequest;