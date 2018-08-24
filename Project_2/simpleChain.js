/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  return db.put(key, value);
}

// Get data from levelDB with key
function getLevelDBData(key){
  return db.get(key);
}

// Get size of levelDB
function getLevelDBSize(){
  return new Promise((resolve, reject) => {
    let i = 0;
    db.createReadStream().on('data', function(data) {
      i++;
      console.log(data);
    }).on('error', err => {
      console.log('Unable to read data stream!', err);
      reject(err);
    // }).on('close', function() {
    //   console.log('Stream closed at ' + i);
    //   resolve(i);
    }).on('end', () => {
      console.log('Stream ended at ' + i);
      resolve(i);
    });
  });

}

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    let that = this;
    getLevelDBSize().then(size => {
      // Initialize chainLength so that we can maintain it internally
      that.chainLength = size;
      // If this is the first time we are initializing, we need to add the genesis block
      if (size === 0) {
        that.addBlock(new Block("First block in the chain - Genesis block"));
      }
    }).catch(err => {
      console.log('Unable to initialize Blockchain');
      throw err;
    });
  }

  // Prepare and push block
  prepareAndPushBlock(newBlock) {
    let that = this;
    // Block height
    newBlock.height = that.chainLength;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then(() => {
      console.log('Added block #' + newBlock.height);
      // Increment chainLength after insertion is confirmed
      that.chainLength += 1;
    }).catch(err => {
      console.log('Failed to add block', err);
    });
  }

  // Add new block
  addBlock(newBlock){
    let that = this;
    if(that.chainLength>0){
      // previous block hash
      that.getBlock(that.chainLength - 1).then(previousBlock => {
        newBlock.previousBlockHash = previousBlock.hash;
        that.prepareAndPushBlock(newBlock);
        return newBlock;
      }).catch(err => {
        console.log('Failed to get previous Block');
        throw err;
      });
    } else {
      that.prepareAndPushBlock(newBlock);
    }
  }

  // Get block height
  getBlockHeight(){
    // I have chosen to maintain chain length as a variable
    // rather than calculating height everytime I need to add a block
    return this.chainLength - 1;
  }

  // get block
  getBlock(blockHeight){
    return getLevelDBData(blockHeight).then(block => {
      // We need to parse from string
      return JSON.parse(block);
    })
  }

  // validate block
  validateBlock(blockHeight){
    let that = this;
    return new Promise((resolve, reject) => {
      // get block object
      that.getBlock(blockHeight).then(block => {
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
          console.log('Validated block #' + blockHeight);
          resolve(true);
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          resolve(false);
        }
      });
    });
  }

 // Validate blockchain
  validateChain(){
    let that = this;
    let errorLog = [];
    let promises = [];
    if (that.chainLength > 1) {
      // If chain has multiple blocks
      for (let i = 0; i < that.chainLength-1; i++) {
        // validate block
        let promiseBlockValidate = that.validateBlock(i).then(result => {
          if(!result) {
            errorLog.push(i);
          }
        });
        promises.push(promiseBlockValidate);
        // compare blocks hash link
        let indices = [i , i+1];
        // We need to get the blocks before we can compare their hashes
        let promiseCompareHashes = Promise.all(indices.map(that.getBlock)).then(blocks => {
          let blockHash = blocks[0].hash;
          let previousBlockHash = blocks[1].previousBlockHash;
          if (blockHash!==previousBlockHash) {
            console.log('Block #'+blocks[0].height+' and #'+blocks[1].height+' don\'t link');
            errorLog.push(i);
          }
        });
        promises.push(promiseCompareHashes);
      }
    }
    if (that.chainLength > 0) {
      // We must validate the last block as the above check doesn't do the same
      let promiseBlockValidate = that.validateBlock(that.chainLength-1).then(result => {
        if(!result) {
          errorLog.push(that.chainLength-1);
        }
      });
      promises.push(promiseBlockValidate);
    }
    // We evaluate errorLog after all promises complete
    Promise.all(promises).then(() => {
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    });
  }
}
