# Adding a web service to blockchain

## Framework

Express - http://expressjs.com

## REST API

### Request Validation

```
POST : /requestValidation

Header -
'Content-Type'='application/json; charset=UTF-8'

Body -
{
      "address": [address]
}
```

### Message signature validation

```
POST : /message-signature/validate

Header -
'Content-Type'='application/json; charset=UTF-8'

Body -
{
	"address": [address],
	"signature": [message-signature]
}
```

### Register star

```
POST : /block

Header -
'Content-Type'='application/json; charset=UTF-8'

Body -
{
      "address": [address],
      "star": [star-details]
}
```

### Query star by block height

```
GET : /block/[blockHeight]
```

### Query star by block hash

```
GET : /stars/hash:[blockHash]
```

### Query stars by address

```
GET : /stars/address:[address]
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install express with --save flag
```
npm install express --save
```
- Install body-parser with --save flag
```
npm install body-parser --save
```
- Install bitcoinjs-lib with --save flag
```
npm install bitcoinjs-lib --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```

## Testing

To test code:
1. Open a command prompt or shell terminal after install node.js.
2. Run the web server
```
node index.js
```
3. Send a POST request on the url http://localhost:8000/requestValidation with your wallet address.
```
{
	"address": "mzrK2GibBFao1b31C8fDST64e777Qqfpeg"
}
```
This will return a JSON with a message field
4. Using your wallet, sign the returned message
5. Send a POST request on the url http://localhost:8000/message-signature/validate with your address and message signature
```
{
	"address": "mzrK2GibBFao1b31C8fDST64e777Qqfpeg",
	"signature": "II+cI9eRosVbSgbT+fV0V4A1jIr0hMZzpFnRJJgdDMCuTaKJbzIcUJIre5LCOOxRmm4SpTvIjPVikKtedCeSVnM="
}
```
6. If you were able to successfully able to send the validation in 5 mins of requesting it, you will get a response indicating registerStar as true. This indicates that you can now register stars with your wallet address. Note, in the current implementation, once a wallet is validated you can register stars with that address with no time constraint. This behavior can be changed if desired.
7. To register a star, send a POST request on the url http://localhost:8000/block with the address and details of the star
```
{
  "address": "mzrK2GibBFao1b31C8fDST64e777Qqfpeg",
  "star": {
    "dec": "-22° 29' 24.9\"",
    "ra": "6h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}
```
8. You can query the star directly if you know the block height by sending a GET request to http://localhost:8000/block/[blockHeight]
9. You can query the star directly if you know the block hash by sending a GET request to http://localhost:8000/stars/hash:[blockHash]
10. You can get all stars registered by a wallet by sending a GET request to http://localhost:8000/stars/address:[address]

