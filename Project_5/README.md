# Star Notary Smart Contract

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Install Truffle
```
npm install -g truffle
```
- Install Truffle HDWallet Provider
```
npm install -g truffle-hdwallet-provider
```
- Install Mocha Param to support parameterized unit tests
```
npm install --save-dev mocha-param
```
- Use NPM to install OpenZeppelin dependencies
```
cd smart_contracts
npm install
```

## Testing

### Unit tests

- Run Truffle tests
```
truffle test
```

### Deploying contract

- Set wallet's mnemonic in truffle.js where "INSERT_MNEMONIC_HERE" is mentioned
- Migrate contracts to rinkeby
```
truffle migrate --network rinkeby --reset
```

### Interacting with contract

- Run truffle console
```
truffle console --network rinkeby
```
- Create Star
```
StarNotary.at("0x98f5c7ad1a22f56d42cf4cc169ea3b00ec17d649").createStar("awesome star!", "this star was bought while travelling to NY", "1", "1", "1", 1)
```
- Put Star up for sale
```
starPrice = web3.toWei(.01, "ether")
StarNotary.at("0x98f5c7ad1a22f56d42cf4cc169ea3b00ec17d649").putStarUpForSale(1, starPrice)
```

### Details of contract deployment and usage

- Contract deployed at https://rinkeby.etherscan.io/address/0x98f5c7ad1a22f56d42cf4cc169ea3b00ec17d649
- Star creation at https://rinkeby.etherscan.io/tx/0xf71ec6e9a450225e467094de936fc4024d63dde88cb31617e9fb2f95b91861ea
- Star put up for sale at https://rinkeby.etherscan.io/tx/0x341b6755e7ac8741df86a1abb1316f0d8f235a176650846682a5e81376c8d7ee

### Frontend code

- Updated index.html to enable claiming and searching of stars