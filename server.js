var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var Provider = require('react-redux').Provider;
var mongoose = require('mongoose');
var less = require('less-middleware');
var webpack = require('webpack');
var config = require('./webpack.config');
// var jwt = require('jsonwebtoken');

// Load environment variables from .env file
dotenv.load();

// ES6 Transpiler
require('babel-core/register');
require('babel-polyfill');

// Controllers
var tagLocationController = require('./controllers/tagLocation');
var receiverController = require('./controllers/receiver');
var tagController = require('./controllers/tasks');
var layoutController = require('./controllers/layout');
var gateEntryController = require('./controllers/gateEntry');
// var userController = require('./controllers/users');

// React and Server-Side Rendering
var routes = require('./app/routes');
var configureStore = require('./app/store/configureStore').default;

var app = express();

var compiler = webpack(config);

mongoose.connect(process.env.DB_HOST+":"+process.env.DB_PORT);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(less(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next) {
//   req.isAuthenticated = function() {
//     var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
//     try {
//       return jwt.verify(token, process.env.TOKEN_SECRET);
//     } catch (err) {
//       return false;
//     }
//   };

//   if (req.isAuthenticated()) {
//     var payload = req.isAuthenticated();
//     User.findById(payload.sub, function(err, user) {
//       req.user = user;
//       next();
//     });
//   } else {
//     next();
//   }
// });

if (app.get('env') === 'development') {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}


app.post('/tags/location', tagLocationController.addLocation);
app.post('/tags', tagLocationController.addTag);
app.get('/tags', tagLocationController.getLastActiveTag);

app.get('/locations', tagLocationController.getLocations);
app.get('/locations/:taskId/history',  tagLocationController.getLocationHistory);
app.get('/locations/tasks/:id',  tagLocationController.getCurrentLocationOfTag);

app.post('/receivers',  receiverController.addReceiver);
app.get('/receivers',  receiverController.getReceivers);
app.delete('/receivers/:id',  receiverController.deleteReceiver);

app.post('/tasks',  tagController.addTask);
app.get('/tasks',  tagController.getTasks);
app.delete('/tasks/:id',  tagController.deleteTask);

app.post('/layout_chunks',  layoutController.addLayoutPart);
app.get('/layout_chunks',  layoutController.getLayoutPart);
app.get('/layout_chunks/:id',  layoutController.getLayoutChunksById);
app.put('/layout_chunks/:id',  layoutController.updateLayoutChunkById);
app.delete('/layout_chunks/:id',  layoutController.deleteLayoutChunkById);

app.post('/layouts',  layoutController.addLayout);
app.get('/layouts',  layoutController.getLayout);
app.delete('/layouts/:id',  layoutController.deleteLayout);

app.post('/gate_entries',  gateEntryController.addGateEntry);
app.get('/gate_entries',  gateEntryController.getGateEntries);


// React server rendering
app.use(function(req, res) {
  var initialState = {
    messages: {}
  };

  var store = configureStore(initialState);

  Router.match({ routes: routes.default(store), location: req.url }, function(err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message);
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      var html = ReactDOM.renderToString(React.createElement(Provider, { store: store },
        React.createElement(Router.RouterContext, renderProps)
      ));
      res.render('layout', {
        html: html,
        initialState: store.getState()
      });
    } else {
      res.sendStatus(404);
    }
  });
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);

module.exports = app;

//Socket io to pass new tag location to client
io.on('connection', function (socket) {
  console.log('---------------------a user connected---------------------');
  setInterval(function(){
    tagLocationController.pollForNewLocations(socket);
  },20000);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('error', function (err) { 
     console.log("-----------------Socket.IO Error-----------------"); 
     console.log(err.stack); // this is changed from your code in last comment
  });

});
