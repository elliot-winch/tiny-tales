const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const game = require('./game.js');
const gameActions = require('./game-actions.js');

const characterCreationData = require('./character-creation-data.js');
const sceneCreationData = require('./scene-creation-data.js');


require('./db.js');
const mongoose = require('mongoose');
const Scene = mongoose.model("Scene");
const User = mongoose.model("User");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));


//passport
const passport = require('passport');

require('./passport.js')(passport);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
      }

    // if they aren't redirect them to the home page
    res.redirect('/login');
}


//Routes
app.get('/', isLoggedIn, (req, res) => {

  const maxNumToDisplay = 5;
  const userSceneData = [];
  const publicSceneData = [];

  let index = 0;

  const userScenePromise = new Promise(function(resolve, reject) {
    Scene.findOne( {"_id" : req.user.scenes[index++] }, (err, data, count) => {

      if(err){
        console.log("App Warning: Attepted to find scene with ID: " + req.user.scenes[index-1] + " but failed with error: " + err);
        reject();
      } else {
        userSceneData.push(data);
        resolve();
      }
    });
  });

  //Public scenes
  const publicScenePromise = new Promise(function(resolve, reject) {
    Scene.find( {}, (err, data, count) => {
      if(err){
        reject();
      } else {
        data.forEach( (elem) => {
          publicSceneData.push(elem);
        });

        resolve();
      }
    }).limit( maxNumToDisplay );
  });


  const homescreenPromises = new Array( Math.min(req.user.scenes.length, maxNumToDisplay) );

  for(let i = 0; i < homescreenPromises.length; i++){
    homescreenPromises[i] = userScenePromise;
  }

  homescreenPromises.push(publicScenePromise);

  Promise.all(homescreenPromises).then( function(values){

    for(let i = userSceneData.length; i >= 0; i--){
      if(userSceneData[i] == null){
        userSceneData.splice(i, 1);
      }
    }

    res.render('homescreen.hbs', {
        user : true,
        myScenes : (userSceneData.length > 0) ? userSceneData : undefined,
        publicScenes : publicSceneData,
    });
  }).catch( () => {
    res.render('homescreen.hbs', {
        user : true,
        myScenes : undefined,
        publicScenes : undefined,
    });
  });
});

//Scene creation
app.get('/new-scene', isLoggedIn, (req, res) => {

  res.render('new-scene', {
    user : true,
    descriptor : sceneCreationData.descriptor,
    objective : sceneCreationData.objective
  });
});

const DungeonMaster = new game.Character(
  "Dungeon Master",
  "Immortal",
  "Narrator",
  "Infinite Wisdom",
  "Maintain order in the universe"
);

app.post('/new-scene', isLoggedIn, (req, res) => {

  let characterObj = {};
  characterObj['dm'] = DungeonMaster;

  const newScene = new Scene({
    createdBy : req.user.email,
    createdAt : + new Date(),
    info : new game.Scene(req.body.name, req.body.descriptor1 + " and " + req.body.descriptor2, req.body.objective),
    messages : [],
    characters : characterObj,
  });

  newScene.save( function(err, data, count) {
    if(err || data === undefined) {
      res.status(500).send("Scene failed to save in the database");
    }

    Scene.aggregate([
      {
        $sort : { createdAt : 1 }
      }
    ]);

    res.redirect('scene/' + data._id);

  });
});
//Character creation
app.get('/create-character/:slug', isLoggedIn, (req, res) => {

  if (req.params.slug === undefined){
    res.status(404).send("Scene not found");
  }

  res.render('create-character', {
    user: true,
    races: characterCreationData.races,
    classes: characterCreationData.classes,
    attributes: characterCreationData.attributes,
    motives: characterCreationData.motives,
  });
});

app.post('/create-character/:slug', isLoggedIn, (req, res) => {

  if (req.params.slug === undefined){
    res.status(500).send("Scene not found");
  }

  const updatingObj = {};
  updatingObj['characters.' + req.user.local.email] = new game.Character(req.body.name, req.body.race, req.body.gameClass, req.body.attribute, req.body.motive);

  const sceneUpdatePromise = new Promise( function(resolve, reject){
      Scene.findOneAndUpdate( {_id:req.params.slug} , { $set:  updatingObj }, {upsert: true} , (err, data, count) => {
        if(err){
          console.log("Scene findOneAndUpdate rejected with", err);
          reject();
        } else {
          resolve();
        }
      });
  });

  const userUpdatePromise = new Promise( function(resolve, reject){

    User.findOneAndUpdate({ "local.email" : req.user.local.email },  { $push: { 'scenes' : req.params.slug } }, {upsert: true}, (err, data) => {
      if(err){
        console.log("User findOneAndUpdate rejected with", err);
        reject();
      } else {
        resolve();
      }
    });
  });

  Promise.all([sceneUpdatePromise, userUpdatePromise]).then(
    (values) => { res.redirect('/scene/' + req.params.slug,), { user:true }},  //resolve
    (values) => { res.status(500).send("Scene not found");}, //reject
  )
});


//Actual scene


app.get('/scene/:slug', isLoggedIn, (req, res) => {

  if (req.params.slug === undefined){
    res.status(500).send("Scene not found");
  }

  //attempt to get the scene from the database
  Scene.findOne( {_id:req.params.slug}, function(err, data) {
    if(err || data === undefined){
      res.status(500).send("Scene not found");
    }

    //The player does not exist in the character list, so redirect to character creation
    //This is where we might implement private / public scenes

    if(data.characters[req.user.local.email] === undefined || data.characters[req.user.local.email] === null){
        res.redirect('/create-character/' + req.params.slug);
        return;
    }

    res.render('scene.hbs', {
      user: true,
      "email" : req.user.local.email,
      "scene" : data.info,
      "character" : data.characters[req.user.local.email],
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
}));


app.get('/logout', isLoggedIn, function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/register', function(req, res) {
  res.render('register')
});

app.post('/register', passport.authenticate('local-register', {
    successRedirect : '/',
    failureRedirect : '/register',
}));

//SocketIO

const http = require('http').Server(app);
const io = require('socket.io')(http);


io.on('connect', (socket) => {
    //load all previous messages

    socket.on('joinroom', function(room){

      const roomSplit = room.split('/');
      const sceneID = roomSplit[roomSplit.length - 1];

      socket.join(sceneID);

      Scene.findOne( {_id: sceneID }, (err, data) => {
        if(err || data === undefined){
          console.log("Failed to load scene");
          return;
        }

        socket.emit('joinroom', data.messages, data.characters);

        io.to(sceneID).emit("updateUI", data);
      });
    });


    socket.on("sendMessage", (room, messageData) => {

      const roomSplit = room.split('/');
      const sceneID = roomSplit[roomSplit.length - 1];


      //Scene.findOneAndUpdate( {_id:sceneID}, { $push: { 'messages' : messageData } }, {upsert: true} , (err, data, count) => {
      Scene.findOne( {_id:sceneID}, (err, sceneData) => {

        if(err){
          console.log("Failed to save message", err);
          return;
        }

        const character = sceneData.characters[messageData.email];

        const messageBreakDown = messageData.text.split(' ');
        let shouldDisplayUserText = true;

        gameActions.actions.some( x => {

          //case insentive
          if(x.keyword.toUpperCase() === messageBreakDown[0].toUpperCase()){

            messageBreakDown.shift();

            x.activate(sceneData, character, ...messageBreakDown).then( (successObject) => {

              const actionMessageData = {
                text : successObject.actionMessage,
                email : "dm"
              }

              successObject.newSceneData.messages.push(actionMessageData);

              const updater = {
                "messages" : successObject.newSceneData.messages,
                "info" : successObject.newSceneData.info,
                "characters" : successObject.newSceneData.characters,
              };

              Scene.update( {_id:sceneID}, { $set : updater } , (err, data) => {

                if(err) {
                  console.log(err);
                  return;
                }

                io.to(sceneID).emit("sendMessage", actionMessageData, DungeonMaster);
                io.to(sceneID).emit("updateUI", successObject.newSceneData);
              });

            }).catch( (actionMessage) => {

              //Tis message is intentionally not saved in the database
              const actionMessageData = {
                text : actionMessage,
                email : "dm"
              }

              socket.emit("sendMessage", actionMessageData , DungeonMaster);
            });

            shouldDisplayUserText = false;
            return true;
          }

          return false;
        });

        if(shouldDisplayUserText){

          Scene.update( {_id:sceneID}, { $push: { 'messages' : messageData } }, {upsert: true} , (err, data, count) => {

            io.to(sceneID).emit("sendMessage", messageData, character);
          });
        }
      });
    });

    socket.on('disconneted', () => {
      console.log("A User Disconnected");
    });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening');
});
