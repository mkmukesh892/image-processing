//Install express server
const express = require('express');
const path = require('path');
const jsonServer = require('json-server');
const app = express();
const server = jsonServer.create();
const router = jsonServer.router('api/pics.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);

server.listen(port);
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/image-processing'));

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/image-processing/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);