function createMonitor(config) {
    var width = config.width || 40;
    var height = (config.height || 25) - 1;
    var entryPrompt = config.entryPrompt || "> ";
    var lines = [];
    var entryBuffer = "";

    var refresh = (function() {
        var displayBuff = function() {
            var buff = lines.slice();
            buff.push(entryPrompt + entryBuffer);
            return buff;
        };
        if (config.sendLines) {
            return function() { config.sendLines(displayBuff()); };
        } else {
            var writeElement = document.getElementById(config.eleId || "monitor");
            return function() { 
                writeElement.innerText = displayBuff().join("\n");
                writeElement.innerHTML += "<span id='cursor'></span>";
            }
        }
    })();
    var write = function(msg) {
        splitTextLine(width, msg).forEach(x => lines.push(x));
        while(lines.length>height) { lines.shift(); }
        refresh();
    };
    var sendKey = function(keyEvent) {
        // var isLetter = /^[A-Z]$/i.test;
        var key = keyEvent.key;
        if (key==='Backspace') {
            if (entryBuffer.length>0) {
                entryBuffer = entryBuffer.substring(0, entryBuffer.length - 1);
                refresh();
            }
        } else if (key==='Enter') {
            var nInput = entryBuffer;
            var line = entryPrompt + entryBuffer;
            entryBuffer = "";
            write(line);
            if (config.notifyInput) {
                config.notifyInput(nInput);
            }
        } else if (key===' ' || /^[A-Z]$/i.test(key)) {
            entryBuffer += key;
            refresh();
        }
    };
    if (!config.noKeyBind) {
        window.addEventListener("keydown", function(event) {
            sendKey(event)
            }, true);
    }
    return {
        write: function(msg) { write(msg); },
        clear: function() { lines = []; refresh(); },
        sendKey: function(keyEvent) { sendKey(keyEvent); },
    }
}

function splitTextLine(width, msg) {
    if (!msg) { return [""]; }
    // if (!msg || msg.trim().length===0) { return [""]; }
    var result = [ ];
    msg.split("\n").forEach(function (line) {
        var s = line.trim().split().join(" ");
        if (s.length==0) { 
            result.push("");
        } else {
            while (s.length>width) {
                var idx = s.lastIndexOf(" ", width);
                if (idx === -1) { idx = width; }
                result.push(s.substring(0,idx));
                s = s.substr(idx + 1);
            }
            if (s.length>0) { result.push(s);  }
        }
    });
    return result;
}

exports.createMonitor = createMonitor;
exports.splitTextLine = splitTextLine;

/*
function createKey()
    var e = new Event("keydown");
    e.key="a";    // just enter the char you want to send 
    e.keyCode=e.key.charCodeAt(0);
    e.which=e.keyCode;
    e.altKey=false;
    e.ctrlKey=true;
    e.shiftKey=false;
    e.metaKey=false;
    e.bubbles=true;
    document.dispatchEvent(e);
}

function splitTextLine(width, msg) {
    // if (!msg || msg.trim().length===0) { return [""]; }
    var result = [ ];
    var s = msg.trim().split().join(" ");
    while (s.length>width) {
        var idx = s.lastIndexOf(" ", width);
        if (idx === -1) { idx = width; }
        result.push(s.substring(0,idx));
        s = s.substr(idx + 1);
    }
    if (s.length>0) { result.push(s);  }
    return result;
}

*/