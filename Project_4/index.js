const express = require('express')
const app = express()
const bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const simpleChain = require('./simpleChain.js')

let blockchain = new simpleChain.Blockchain();

// Key constants and global variables
const validationWindow = 300; // 5 mins
// Map from wallet address to validation request timestamp
let blockchainIDValidationTimeoutMap = new Map();
// Map from wallet address to check validation status
let blockchainIDValidatedMap = new Map();
// Map from wallet address to array of block heights assigned with that address
let blockchainIDToBlocksMap = new Map();
// Map from block hash to block height
let blockHashToBlockMap = new Map();

// Populate maps from block
function populateMapsFromBlock(block) {
  // We should populate maps only if the block body has an address and star object, else we can ignore it
  if (block.body.address && block.body.star) {
    let blockchainID = block.body.address;
    let blocks = blockchainIDToBlocksMap.get(blockchainID);
    if (blocks === undefined) {
      blocks = [];
    }
    blocks.push(block.height);
    blockchainIDToBlocksMap.set(blockchainID, blocks);
    blockHashToBlockMap.set(block.hash, block.height);
  }
}

// Populate maps by reading all blocks from the blockchain
function populateMaps() {
  // Populate maps by reading the entire blockchain
  let indices = [];
  let blockHeight = blockchain.getBlockHeight();
  // Skip genesis block
  if (blockHeight > 0) {
    let promises = [];
    for (let i = 1; i <= blockHeight; i++) {
      let promise = blockchain.getBlock(i).then(block => populateMapsFromBlock(block));
      promises.push(promise);
    }
    Promise.all(promises).then(() => console.log('Populated internal maps'));
  }  
}
// Invoke population of Maps after 100ms of instatiating the blockchain to give enough time to load the same
setTimeout(populateMaps, 100);


app.post('/requestValidation', jsonParser, (req, res, next) => {
  // Valide that we have a valid request
  if (!req.body ||
      !req.body.address || !(typeof req.body.address === 'string')) {
    return res.sendStatus(400);
  }

  let blockchainID = req.body.address;
  // Get validation request timestamp if earlier made
  let requestTimestamp = blockchainIDValidationTimeoutMap.get(blockchainID);
  let currTimestamp = Math.floor((new Date().getTime()) / 1000);
  let timeRemaining = validationWindow;
  if (requestTimestamp == undefined) {
    // This is the first time we are getting a request for this blocchainID
    blockchainIDValidationTimeoutMap.set(blockchainID, currTimestamp);
    requestTimestamp = currTimestamp;
  } else {
    // We have an earlier got a request. We should calculate time remaining
    let timeElapsed = currTimestamp - requestTimestamp;
    // If we have crossed the validationWindow we should reset timestamps
    if (timeElapsed >= validationWindow) {
      blockchainIDValidationTimeoutMap.set(blockchainID, currTimestamp);
      requestTimestamp = currTimestamp;
      timeRemaining = validationWindow;
    } else {
      timeRemaining = validationWindow - timeElapsed;
    }
  }
  let response = {
    'address': blockchainID,
    'requestTimeStamp': requestTimestamp.toString(),
    'message': blockchainID + ':' + requestTimestamp.toString() + ':' + 'starRegistry',
    'validationWindow': timeRemaining.toString()
  };
  res.send(response);
});

app.post('/message-signature/validate', jsonParser, (req, res, next) => {
  // Valide that we have a valid request
  if (!req.body ||
      !req.body.address || !(typeof req.body.address === 'string') ||
      !req.body.signature || !(typeof req.body.signature === 'string')) {
    return res.sendStatus(400);
  }

  let blockchainID = req.body.address;
  // Get validation request timestamp if earlier made
  let requestTimestamp = blockchainIDValidationTimeoutMap.get(blockchainID);

  if (requestTimestamp == undefined) {
    // The user failed to validate earlier
    res.status(500);
    res.send({'registerStar': false, 'error': 'Blockchain ID validation not requested'});
  } else {
    let currTimestamp = Math.floor((new Date().getTime()) / 1000);
    let timeElapsed = currTimestamp - requestTimestamp;
    let timeRemaining = validationWindow - timeElapsed;
    let message = blockchainID + ':' + requestTimestamp.toString() + ':' + 'starRegistry';
    let registerStar = true;
    let messageSignature = 'valid';
    // Check if we have crossed the validationWindow
    if (timeRemaining <= 0) {
      registerStar = false;
      timeRemaining = 0;
      res.status(500);
    }
    // Check if message signature is valid
    if (!bitcoinMessage.verify(message, blockchainID, req.body.signature)) {
      registerStar = false;
      messageSignature = 'invalid';
      res.status(500);
    }

    let response = {
      'registerStar': registerStar,
      'status': {
        'address': blockchainID,
        'requestTimestamp': requestTimestamp.toString(),
        'message': message,
        'validationWindow': timeRemaining.toString(),
        'messageSignature': messageSignature
      }
    };
    res.send(response);
    blockchainIDValidatedMap.set(blockchainID, registerStar);
  }
});

app.post('/block', jsonParser, (req, res, next) => {
  // Valide that we have a valid request
  if (!req.body ||
      !req.body.address || !(typeof req.body.address === 'string') ||
      !req.body.star || !(typeof req.body.star === 'object') ||
      !req.body.star.dec || !(typeof req.body.star.dec === 'string') ||
      !req.body.star.ra || !(typeof req.body.star.ra === 'string') ||
      !req.body.star.story || !(typeof req.body.star.story === 'string') || (req.body.star.story.length > 500)) {
    return res.sendStatus(400);
  }

  let blockBody = req.body;

  if(blockchainIDValidatedMap.get(blockBody.address) !== true) {
    // The user has not validated the wallet
    res.status(403);
    return res.send({'error': 'Blockchain ID validation is incomplete'});
  }

  // Hex code the story
  blockBody.star.story = new Buffer.from(blockBody.star.story).toString('hex');

  blockchain.addBlock(new simpleChain.Block(blockBody)).then(block => {
    populateMapsFromBlock(block);
    res.send(block)
  }).catch(next);
});

// Decodes story from hex to ascii
function decodeBlock(block) {
  block.body.star.storyDecoded = new Buffer.from(block.body.star.story, 'hex').toString();
  return block;
}

app.get('/stars/address::address', (req, res, next) => {
  let blockchainID = req.params.address;
  if (!(blockchainIDToBlocksMap.has(blockchainID))) {
    res.status(404);
    return res.send({'error': 'No stars registered with address ' + blockchainID});
  }
  Promise.all(blockchainIDToBlocksMap.get(blockchainID).map(blockchain.getBlock)).then(blocks => {
    let decodedBlocks = blocks.map(decodeBlock);
    res.send(decodedBlocks);
  }).catch(next);
});

app.get('/stars/hash::hash', (req, res, next) => {
  let blockHash = req.params.hash;
  if (!(blockHashToBlockMap.has(blockHash))) {
    res.status(404);
    return res.send({'error': 'No stars registered with block hash ' + blockHash});
  }
  blockchain.getBlock(blockHashToBlockMap.get(blockHash)).then(block => res.send(decodeBlock(block))).catch(next);
});

app.get('/block/:blockHeight', (req, res, next) => {
  let blockHeight = parseInt(req.params.blockHeight);
  // Validate that requested block height is greater than 0 as that is the genesis block
  if (blockHeight === 0) {
    return res.sendStatus(400);
  }
  // Validate that requested block height is present on the blockchain
  if (blockHeight > blockchain.getBlockHeight()) {
    res.status(404);
    return res.send({'error': 'Requested block at height ' + blockHeight + ' not present on the chain'});
  }
  blockchain.getBlock(req.params.blockHeight).then(block => res.send(decodeBlock(block))).catch(next);
});

app.listen(8000, () => console.log('Listening on port 8000!'))
