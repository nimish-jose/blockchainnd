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
StarNotary.at("0x40b6713eb1e3576b963773b26c213f63418f96fc").createStar("awesome star!", "this star was bought while travelling to NY", "1", "1", "1", 1)
```
- Put Star up for sale
```
starPrice = web3.toWei(.01, "ether")
StarNotary.at("0x40b6713eb1e3576b963773b26c213f63418f96fc").putStarUpForSale(1, starPrice)
```

### Details of contract deployment and usage

- Contract deployed at https://rinkeby.etherscan.io/address/0x40b6713eb1e3576b963773b26c213f63418f96fc
- Star creation at https://rinkeby.etherscan.io/tx/0x13825bc373012992c5949ca771083a9ce34ec22f4015e7c148eb10c8f9d38e3d
- Star put up for sale at https://rinkeby.etherscan.io/tx/0xb6d21e583808dbde20c62fe14f04eb2b77c7b1586cd80709f6255e3e088caf76

### Frontend code

- Updated index.html to enable claiming and searching of stars