const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true }, //this required makes it so that name and product both are sent through the post request
  price: { type: Number, required: true },
});

module.exports = mongoose.model('Product', productSchema);
