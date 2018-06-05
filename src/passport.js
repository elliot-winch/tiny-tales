
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;

require('./db');
const User = mongoose.model("User");

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-register', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log("Registration Log: A user with the email " + email + " is attempting to register");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
          console.log("Database search complete with ", err, user);
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                console.error("Registration Error: The email" + email + "is already registered with Tiny Tales!");
                return done(null, false);
            } else {
                // if there is no user with that email
                // create the user
                const newUser = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.scenes = [];

                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log("Registration Log: A user with the email " + email + " has successfully registered");
                    return done(null, newUser);
                });
            }

        });

        });

    }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        User.findOne({ 'local.email' :  email }, function(err, user) {
          console.log("Search complete", err, user);
            // if there are any errors, return the error before anything else
            if (err) {
              console.log("Error!", err);
              return done(err);
            }

            // if no user is found, return the message
            if (!user) {
              console.log("User does not exist");
              return done(null, false);
            }

            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
              console.error("Sign In Error: Email or password is incorrect");
              return done(null, false);
            }

            console.log("Sign In Log: A user with the email " + email + " has successfully logged in");
            // all is well, return successful user
            return done(null, user);
        });

    }));

};
