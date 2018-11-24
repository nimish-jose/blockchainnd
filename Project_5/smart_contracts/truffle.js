var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'INSERT_MNEMONIC_HERE';

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*"
    }, 
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/a70fea26512b4baf9bd368b29f9eb0e1')
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};