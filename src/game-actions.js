
const game = require('./game.js');

const Action = class Action {
  constructor(keyword, activate) {
    this.keyword = keyword;
    this.activate = activate;      //a promise that effects something in the scene
  }
}

//Inventory
function addItem(obj, item){

  if(obj.inventory === undefined){
    console.log("Warning: Attempting to add an item to an object without an inventory");
    return;
  }

  for(let i = 0; i < obj.inventory.length; i++){
    if(obj.inventory[i].name.toUpperCase() === item.name.toUpperCase()){
      obj.inventory[i].quantity += item.quantity;
      return;
    }
  }

  obj.inventory.push(item);
}

function removeItemByName(obj, name, quantity = 1){
  if(obj.inventory === undefined){
    console.log("Warning: Attempting to remove an item from an object without an inventory");
    return;
  }

  for(let i = 0; i < obj.inventory.length; i++){
    if(obj.inventory[i].name.toUpperCase() === name.toUpperCase()){
      if(obj.inventory[i].quantity - quantity < 0){
        return undefined;
      } else if (obj.inventory[i].quantity - quantity == 0){
        const item = obj.inventory[i];
        obj.inventory.splice(i, 1);
        return item;
      } else {
        const diff = obj.inventory[i].quantity - quantity;
        obj.inventory[i].quantity -= quantity;
        return new game.Item(name, quantity);
      }
    }
  }
}


const takeItemAction = new Action("Take", (sceneData, characterData, itemName, quantity, inventoryName) => {

  return new Promise(function(resolve, reject) {

      if(itemName === undefined){
        reject("What should I take? [To take from the environment type: take <item name> <quantity>. To take form another player: take <item name> <quantity> <player name>]");
      }

      if(quantity === undefined){
        quantity = 1;
      }

      quantity = parseInt(quantity);

      if(isNaN(quantity)){
        reject("How many should I take? [To take from the environment type: take <item name> <quantity>. To take form another player: take <item name> <quantity> <player name>]");
      }

      //Find inventory
      let inventoryObject = undefined;

      if(inventoryName === undefined){
        inventoryObject = sceneData.info;
      } else {
        sceneData.characters.some( x => {

          if(x.name.toUpperCase() === inventoryName.toUpperCase()){
            inventoryObject = x;
          }

          return inventoryObject !== undefined;
        });
      }

      if(inventoryObject === undefined){
        reject("Who do you want to take from? [Couldn't find " + inventoryName + " in the scene]");
      }

      const item = removeItemByName(inventoryObject, itemName, quantity);

      if(item === undefined){
        reject("There are not " + quantity + " " + itemName + "s to take!");
      } else {
        addItem(characterData, item);

        let successString = characterData.name + " took " + itemName;
        successString += (quantity > 1) ? (" (" + quantity + ")") : "";

        const successObject = {
          newSceneData : sceneData,
          actionMessage : successString
        }

        //Scene data has been modified by reference
        resolve(successObject);
      }
  });

});

const dropItemAction = new Action("Drop", (sceneData, characterData, itemName, quantity) => {

  return new Promise(function(resolve, reject) {

      if(itemName === undefined){
        reject("What should I drop? [To drop: drop <item name> <quantity>]");
      }

      if(quantity === undefined){
        quantity = 1;
      }

      quantity = parseInt(quantity);

      if(isNaN(quantity)){
        reject("How many should I drop? [To drop: drop <item name> <quantity>]");
      }

      const item = removeItemByName(characterData, itemName, quantity);

      if(item === undefined){
        reject("You don't have " + quantity + " " + itemName + "s to drop!");
      } else {
        addItem(sceneData.info, item);

        let successString = characterData.name + " dropped " + itemName;
        successString += (quantity > 1) ? (" (" + quantity + ")") : "";

        const successObject = {
          newSceneData : sceneData,
          actionMessage : successString
        }

        //Scene data has been modified by reference
        resolve(successObject);
      }
  });

});

module.exports = {

  actions : [
        takeItemAction,
        dropItemAction,
    ],
}
