const express = require('express')
const app = express()
const bodyParser = require('body-parser');

let jsonParser = bodyParser.json();

const simpleChain = require('./simpleChain.js')

let blockchain = new simpleChain.Blockchain();

app.get('/block/:blockHeight', (req, res, next) => {
	let blockHeight = req.params.blockHeight;
  // Validate that reqquested block height is present on the blockchain
  if (blockHeight > blockchain.getBlockHeight()) {
    res.status(404);
    res.send({error: 'Requested block at height ' + blockHeight + ' not present on the chain'});
  }
	blockchain.getBlock(req.params.blockHeight).then(block => res.send(block)).catch(next);
});


app.post('/block', jsonParser, (req, res, next) => {
  // Valide that we have a valid request
  if (!req.body || !req.body.body || !(typeof req.body.body === 'string')) return res.sendStatus(400);
  blockchain.addBlock(new simpleChain.Block(req.body.body)).then(block => res.send(block)).catch(next);
});

app.listen(8000, () => console.log('Example app listening on port 8000!'))
