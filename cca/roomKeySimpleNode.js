var prompt = require('prompt');
var lib = require("./roomKeySimpleLib.js");

prompt.start();

playGame();

function playGame() {
    var display = function(txt) { console.log(txt); };


    function run(state) {
        promptUserEntryProvider(function(cmd) {
            lib.actionHandler(display, state, cmd);
            if (!state.done) { 
                // hack to avoid deep recursion
                setTimeout(function() { run(state); }, 0);
            }
        });
    }

    lib.intro(display);
    run(lib.initState());
}

function promptUserEntryProvider(listener) {
    prompt.get( '> ', function(err, result) {
        if (err) { console.log(err); }
        listener(result['> ']);
    });
}
