const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); //multer is used to parse forms, install it by npm install --save multer
const checkAuth = require('../middleware/check-auth');

//storage to configure the location a name of the file uploaded
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
}); // setting a folder to where all the files will go, the folder gets created automatically once a post request is sent

const Product = require('../models/product');
// const request = require('../../app');

router.get('/', (req, res, next) => {
  Product.find()
    .select('name price _id productImage') // this is used to select all the things that required to be shown in response
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length, // number of elements(products)
        products: docs.map((doc) => {
          //.map is used to map it to a new array
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// added middleware in the POST method upload
//upload.single() means we will accept one file only also it is a handler and we can add as many as we want
// multer not only gives us request file but also gives a request body
router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  // req.file is available because upload middleware was executed beforehand in the POST route
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'created product successfully',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then((doc) => {
      console.log('from database', doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            description: 'GET_ALL_PRODUCTS',
            url: 'http://localhost:3000/products',
          },
        });
      } else {
        res.status(404).json({
          message: 'No valid entry found for the provided id',
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });

  //   if (id === 'special') {
  //     res.status(200).json({
  //       message: 'You discovered a special ID',
  //     });
  //   } else {
  //     res.status(200).json({
  //       message: `You passed an ID = ${id}`,
  //     });
  //   }
});

router.patch('/:productId', checkAuth, (req, res, next) => {
  //   res.status(200).json({
  //     message: 'updated Product!',
  //   });
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps }) //$set is uses by mongoose
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products/' + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
  //   res.status(200).json({
  //     message: 'Deleted Product!',
  //   });
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Product deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/product',
          body: { name: 'string', price: 'Number' },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
