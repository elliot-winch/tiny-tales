
# Tiny Tales

## Overview

Inspired by Dungeons and Dragons and LucasArt's text adventures, Tiny Tales is a web app that brings adventurers together to roleplay a single scene. It's like at tiny MUD (Multi-User Dungeon). Players are randomly assigned characters, with different traits and personalities, and they act out the scene in the chatroom. They can perform basic actions, such as picking things up, casting spells and attacking creatures (or each other!). 

Please note, Tiny Tales is currently not hosted.

## Data Model

The application will store Scenes, Users, Characters and Messages

* scenes will have multiple messages and characters (by embedding)
* users will have multiple scenes stored (via references)


An Example User:

```javascript
{
  username: "Dulfish the Half Orc",
  hash: // a password hash,
  scenes: //all scenes the user has participated in 
}
```

An Example Scene with Embedded Characters and Messages:

```javascript
{
  users: // all users in the scene
  name: "Dragon's Cave",
  messages : [
    { sentby: /* a character */ "Dulfish", content : "Raaaagh!" },  //if a message contains keywords, like CAST SPELL or PICK UP, then a description of this action will appear instead of a raw message. This might have some effect on the scene, such as damaging a character or adding an item to your inventory.
    { sentby: "The Sorceress", content : "So uncivilised" },
  ],
  character: [ 
    { name: "Dulfish", stats : /* strength, intelligence etc. */ },
    { name: "The Sorceress", stats : /* strength, intelligence etc. */ },
    { name: "Filbert", stats : /* strength, intelligence etc. */ },

  ],
  createdAt: // timestamp
}
```


## [Link to Commented First Draft Schema](db.js) 


## Wireframes and Sitemap

/login - page for logging in to your account

/ - page for showing all active scenes or creating a new, randomly generated scene

/scene/slug - page for displaying a scene: the chatbox, the setting description and the user's randomly generated character

Edit:

/register - registering an account

/new-scene - create a new scene

/create-character/:slug - for creating a new character specific to a scene


## User Stories

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can browse all active scenes
4. as a user, I can join any active scene, where I am assigned a ~~randomly~~ user generated character
5. as a user, I can create a new scene~~, which is randomly generated~~ which is user generated
6. as a user, I can send messages within a scene. Messages containing keywords will appear in the chat as an action, and might cause something in the scene to change
~~// somehow the scene must come to an end. One or more of the following three: users can vote to end a scene; the host can end the scene when they choose; or a message / time limit is reached. I have not decided which ones.~~

## Research Topics

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    *potentially might be scrapped if project scope is too large. However, it is mostly implemented from hw06
* ~~(3 points) Jasmine Unit Testing
    * Always nice to know your code actually works.~~
* (6 points) Socket.IO
    * Used to implement the chatroom feature

14 points total out of 8 required points. Jasmine is mostly for my own sanity.

~~Potentially, I will remove the need to be logged in, and just have characters auto-generate upon joining a room and lost upon leaving. Depends on scope and how much I have to fight to get Socket.IO to work.~~

## [Link to Initial Main Project File](app.js) 

## Annotations / References Used

1. [passport.js authentication docs](http://passportjs.org/docs) 
2. ~~[Jasmine](https://jasmine.github.io/pages/getting_started.html) ~~
3. [Socket.IO](https://socket.io/get-started/chat/)
