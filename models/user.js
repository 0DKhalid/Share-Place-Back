const mongoose = require('mongoose');
const mongooseValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: ObjectId, required: true, ref: 'Place' }]
});

userSchema.plugin(mongooseValidator);

module.exports = mongoose.model('User', userSchema);
