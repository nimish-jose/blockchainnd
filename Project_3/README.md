# Adding a web service to blockchain

## Framework

Express - http://expressjs.com

## REST API

### Get block

```
GET : /block/[blockheight]
```

### Add block

```
POST : /block

Header -
'Content-Type'='application/json; charset=UTF-8'

Body -
{
      "body": [blockdata]
}
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

## Testing

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Run the web server
```
node index.js
```
3: Send a GET request on the url http://localhost:8000/block/[blockheight]
4: Send a POST request on the url http://localhost:8000/block. Make sure to set the 'Content-Type' header parameter to 'application/json; charset=UTF-8'. The json passed in the body should be of the format as shown below
```
{
      "body": "Testing block with test string data"
}
```


