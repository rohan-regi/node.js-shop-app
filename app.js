const express = require('express');
const app = express();
const morgan = require('morgan'); // logger, to install this use, npm install --save morgan
const bodyParser = require('body-parser'); // to parse the request body or the content inside the body
//to install this use,npm install --save body-parser
const mongoose = require('mongoose'); // Mongoose is an object data modeling (ODM) library that provides a rigorous modeling environment for your data
//to install this use,npm install --save mongoose

const productRoutes = require('./api/routes/products.js');
const orderRoutes = require('./api/routes/orders');

mongoose.connect(
  'mongodb+srv://admin:admin@cluster0-kwpux.mongodb.net/<dbname>?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.Promise = global.Promise; // use default node.js promise implementation rather than the mongoose implementation

// tell express to funnel all the requests through this middleware morgan logger
app.use(morgan('dev'));
// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// adding headers to avoid cors errors(CROSS ORIGIN RESOURCE SHARING)
// this attaches a header to all the responses sent
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With,Content-Type,Accept,Authorisation'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/products', productRoutes); // use sets up a middleware which is basically an incoming request has to go through app use
//and whatever we pass thorough it
app.use('/orders', orderRoutes);

// Part below this is error handling

app.use((req, res, next) => {
  const error = new error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
