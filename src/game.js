//load files with data


//functions

function generateLocationDescription() {
  return  "placeholder location description";

}

class ItemHolder {
  constructor() {
    this.inventory = [];
  }
}

const Item = class Item {
  constructor(name, quantity = 1) {
    this.name = name;
    this.quantity = quantity;
  }
}

//classes
class Character extends ItemHolder {
  constructor(
    name  = "Shadow",
    race = "Formless",
    gameClass = "Unknown",
    attribute = "no known distinctive features",
    motive = "find out what my motive is") {

    super();

    this.name = name;
    this.race = race;
    this.gameClass = gameClass;
    this.attribute = attribute;
    this.motive = motive;

  }

  /*
  addAction(action){
    for(let i = 0; i < this.actions.length; i++){
      if(this.actions[i].name === action.name){
        return;
      }
    }

    this.actions.push(action);
  }

  removeActionByName(name){
    for(let i = 0; i < this.action.length; i++){
      if(this.actions[i].name === name){
        this.actions.splice(i, 1);
        return;
      }
    }
  }
  */
}

//TODO: expand
class Enemy {
  constructor() {
    this.name = name;
    this.description = generateCharacterDescription(gameClass);
  }
}

class Scene extends ItemHolder {
  constructor(name, description, objective) {
    super();

    this.name = name;
    this.description = description;
    this.objective = objective;
    this.enemies = [];

    this.inventory = [
      new Item("Apple", 10),
    ];
  }

}

module.exports = {
  Item : Item,
  Character : Character,
  Enemy : Enemy,
  Scene : Scene,
}
