
const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");

//const URLSlugs = require('mongoose-url-slugs')

const SceneSchema = new mongoose.Schema({
  createdBy : String,
  createdAt : Number,
  info : Object,
  messages : [{
    email : String,
    text: String,
  }],
  characters : Object, //an array of objects that map a user email to a character
});

const UserSchema = new mongoose.Schema({

  local : {
    email : String,
    password : String,
  },
  scenes : [String],
});

//Passwords
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

mongoose.model('User', UserSchema);
mongoose.model('Scene', SceneSchema);

//From http://jvers.com/csci-ua.0480-spring2018-008/homework/deploy.html
// is the environment variable, NODE_ENV, set to PRODUCTION?
let dbconf;
if (process.env.NODE_ENV.trim() === 'PRODUCTION') {
  console.log("Using PRODUCTION database");

   // if we're in PRODUCTION mode, then read the configration from a file
   // use blocking file io to do this...
   const fs = require('fs');
   const path = require('path');
   const fn = path.join(__dirname, 'config.json');
   const data = fs.readFileSync(fn);

   // our configuration file will be in json, so parse it and set the
   // conenction string appropriately!
   const conf = JSON.parse(data);
   dbconf = conf.dbconf;
} else {
  console.log("Using dev database");
   // if we're not in PRODUCTION mode, then use
   dbconf = 'mongodb://localhost/tiny-tales';
}

mongoose.connect(dbconf);
