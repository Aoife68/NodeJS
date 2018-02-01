//NoSQL databases have less structure than relational databases
//Mongoose offers us the ability to structure it on an application level rather than a db level
let mongoose = require('mongoose');

//Article Schema
let articleSchema = mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  author:{
    type:String,
    required:true
  },
  body:{
    type:String,
    required: true
  }
});

let Article = module.exports = mongoose.model('Article', articleSchema);
