'use strict';

var Location = Object.freeze({
    Void: 0,
    Player: 1,
    BonePile: 2,
    Wall: 3
});

function initState() {
    return Object.seal({
        done: false,
        doorOpen: false,
        locKey: Location.BonePile,
        locTorch: Location.Wall
    });
}

function intro(display) {
    display([
        "Are you in a dungeon?  You have no memory of the night before or how you got here.",
        "There is a torch burning in a wall sconce, illuminating the what appears to be deep dark hole you've been thrown in.",
        "There is a pile of bones in the corner and a single windowless door."
    ].join(" "));
}

function failOut(display) {
    display("I don't know what you mean");
}

function gameAction(display, s, cmd) {
    if (cmd === "look") {
        display("You see a door, a torch, and a pile of bones.");
    } else if (cmd === "look door") {
        if (s.doorOpen && s.locTorch === Location.Player) {
            display("You can see the way out.");
        } else if (s.doorOpen) {
            display("It is too dark to see beyond the doorway.");
        } else {
            display("The door is locked.");
        }
    } else if (cmd === "open door") {
        if (s.doorOpen) {
            display("The door is already open.");
        } else if (s.locKey === Location.Player) {
            display("You unlock and open the door.  Beyond is dark.");
            s.doorOpen = true;
        } else {
            display("The door is locked.");
        }
    } else if (cmd === "leave" || cmd === "go" || cmd === "exit" || cmd === "use door") {
        if (s.doorOpen && s.locTorch === Location.Player) {
            display("You are free.  Congratulations!");
            s.done = true;
        } else if (s.doorOpen) {
            display("You fall to your death.");
            s.done = true;
        } else {
            display("The locked door bars your escape.");
        }
    } else if (cmd === "look bones" || cmd === "look bone" || cmd === "look pile") {
        if (s.locKey === Location.Void) {
            display("You find a key in the bones.");
            s.locKey = Location.BonePile;
        } else if (s.locKey === Location.BonePile) {
            display("You see bones and a key.");
        } else {
            display("You see a pile of bones.");
        }
    } else if (cmd === "take key" || cmd === "get key") {
        if (s.locKey === Location.Player) {
            display("You already have a key.  You don't see any more around.");
        } else if (s.locKey === Location.BonePile) {
            display("You take the key.");
            s.locKey = Location.Player;
        } else {
            failOut(display);
        }
    } else if (cmd === "look key") {
        if (s.locKey === Location.Player) {
            display("You have a door key.");
        } else if (s.locKey === Location.BonePile) {
            display("You see the key in the bone pile.");
        } else {
            failOut(display);
        }
    } else if (cmd === "look torch") {
        if (s.locTorch === Location.Player) {
            display("The torch is in your hand.");
        } else {
            display("The torch hangs on the wall.");
        }
    } else if (cmd === "take torch" || cmd === "get torch") {
        if (s.locTorch === Location.Player) {
            display("You already have the torch.");
        } else {
            display("You now have the torch.");
            s.locTorch = Location.Player;
        }
    } else if (cmd === "die") {
        display("Goodbye cruel world.");
        s.done = true;
    } else {
        failOut(display);
    }
}

exports.initState = initState;
exports.intro = intro;
exports.actionHandler = gameAction;
