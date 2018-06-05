/**
This is client side js
*/

const socketInstance = io();
socketInstance.emit('joinroom', window.location.pathname);

socketInstance.on('updateUI', updateSideBarUI);
socketInstance.on('joinroom', load);

document.addEventListener('DOMContentLoaded', init);

function init(){

  socketInstance.on('sendMessage', displayMessage);

  const submitButton = document.querySelector(".submitButton");

  submitButton.addEventListener('click', (evt) => {
    //this code only laucnhes for the sending user
    evt.preventDefault();

    const messageString = document.querySelector(".inputMessage").value;

    document.querySelector(".inputMessage").value = "";

    //create question object
    const data = {
      email: userEmail,
      text: messageString,
    }

    socketInstance.emit('sendMessage', window.location.pathname, data);
  });
}

function load(allMessageData, characters){

  for(let i = 0; i < allMessageData.length; i++){
    console.log(characters[allMessageData[i].email]);
    displayMessage(allMessageData[i], characters[allMessageData[i].email]);
  }
}

function displayMessage(messageData, character) {
  //this code happens for every user!

  const messageElem = document.createElement("li");
  messageElem.class = "left clearfix";

  messageElem.innerHTML =[''
    // ,'<span class="chat-img float-left">'
     //,'<img src="https://bootdey.com/img/Content/user_3.jpg" alt="User Avatar"></span>'
     ,'<div class="message">'
     ,'<img class="avatar" width="50px" height="50px" src="../img/' + character.race + '.jpg">'
     ,'<strong class="name">'
     ,character.name
     ,'</strong>'
     ,'<small class="float-right text-muted"><i class="fa fa-clock-o"></i>'
     ,character.race + ' ' + character.gameClass
     ,'</small>'
     ,'<br><p class="text-content">'
     ,messageData.text,
     ,'</div>'
     ].join('');

  messageElem.style.backgroundColor = 'white';

  const messageContainer = document.getElementById('messageParent');

  messageContainer.insertBefore(messageElem, messageContainer.firstChild);

}

function updateSideBarUI(sceneData){

  document.getElementById("location_name").innerHTML = sceneData.info.name;
  document.getElementById("location_description").innerHTML = sceneData.info.description;
  document.getElementById("location_objective").innerHTML = sceneData.info.objective;


  const sceneInvElem = document.getElementById("location_inventory");

  for(let i = 0; i < sceneInvElem.children.length; i++){
    sceneInvElem.children[i];
    sceneInvElem.removeChild(sceneInvElem.children[i]);
  }

  for(let key in sceneData.info.inventory){
    console.log(sceneData.info.inventory[key]);;

    const listElem = document.createElement("li");
    const text = document.createTextNode( sceneData.info.inventory[key].name + " (" + sceneData.info.inventory[key].quantity + ")" );
    listElem.appendChild( text );
    sceneInvElem.appendChild(listElem);
  }

  //Charcter
  const characterData = sceneData.characters[userEmail];

  document.getElementById("character_name").innerHTML = characterData.name;
  document.getElementById("character_race").innerHTML = characterData.race;
  document.getElementById("character_class").innerHTML = characterData.gameClass;

  document.getElementById("character_attribute").innerHTML = characterData.attribute;
  document.getElementById("character_motive").innerHTML = characterData.motive;

  const invElem = document.getElementById("character_inventory");

  for(let child in [...invElem.children]){
    invElem.removeChild(invElem.children[child]);
  }

  console.log(characterData.inventory);
  for(let key in characterData.inventory){

    const listElem = document.createElement("li");
    listElem.innerHTML = characterData.inventory[key].name + " (" + characterData.inventory[key].quantity + ")";

    invElem.append(listElem);
  }
}
