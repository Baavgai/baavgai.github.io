
var Player = { NONE: 0, X: 1, O: 2 };

function Pos(x, y) {
  this.x = Math.floor(x);
  this.y = Math.floor(y);
}
Pos.prototype.isInside = function (topLeft, bottomRight) {
  return this.x >= topLeft.x && this.x <= bottomRight.x
    && this.y >= topLeft.y && this.y <= bottomRight.y;
}


function Rect(topLeft, bottomRight) {
  this.topLeft = topLeft;
  this.bottomRight = bottomRight;
}
Rect.prototype = {
  contains: function (pos) { return pos.isInside(this.topLeft, this.bottomRight); },

  getWidth: function () { return this.bottomRight.x - this.topLeft.x; },

  getHeight: function () { return this.bottomRight.y - this.topLeft.y; },

  getCenter: function () {
    var x = this.topLeft.x + Math.floor(this.getWidth() / 2);
    var y = this.topLeft.y + Math.floor(this.getHeight() / 2);
    return new Pos(x, y);
  },
}



function View() {
  this.status = document.getElementById("status");
  this.canvas = document.getElementById("gameDisplay");
  this.dc = this.canvas.getContext("2d");
  this.dc.line = function (x, y, x2, y2) { this.moveTo(x, y); this.lineTo(x2, y2); };
  this.dc.drawPath = function (style, f) {
    this.beginPath();
    f(this);
    this.closePath();
    this.strokeStyle = style;
    this.stroke();
  };

  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.cellWidth = Math.floor((this.width - (this.GRID_WEIGHT * 2)) / 3);
  this.cellHeight = Math.floor((this.height - (this.GRID_WEIGHT * 2)) / 3);
  this.cells = new Array();
  var idx = 0;
  for (var row = 0; row < 3; row++) {
    var y = (row * this.cellHeight) + (row * this.GRID_WEIGHT);
    for (var col = 0; col < 3; col++) {
      var x = (col * this.cellWidth) + (col * this.GRID_WEIGHT);
      this.cells[idx++] = new Rect(new Pos(x, y), new Pos(x + this.cellWidth, y + this.cellHeight));
    }
  }
}
View.prototype = {
  GRID_WEIGHT: 10, PIECE_WEIGHT: 8, GUTTER: 2,

  setStatus: function (msg) { this.status.innerHTML = msg; },

  addStatus: function (msg) { this.status.innerHTML += '<br/>' + msg; },

  clear: function () {
    var self = this;
    this.dc.clearRect(0, 0, this.width, this.height);
    this.dc.lineWidth = this.GRID_WEIGHT;
    this.dc.drawPath("#000", function (dc) {
      var w = self.width, h = self.height;
      var x = Math.floor(w / 3), y = Math.floor(h / 3);
      dc.line(x, 0, x, h); dc.line(0, y, w, y);
      x *= 2; y *= 2;
      dc.line(x, 0, x, h); dc.line(0, y, w, y);
    });

  },

  getCellForPos: function (pos) {
    for (var i = 0; i < 9; i++) {
      var cell = this.cells[i];
      if (cell.contains(pos)) { return i; }
    }
    return -1;
  },

  markWin: function (firstIndex, lastIndex) {
    var c1 = this.cells[firstIndex], c2 = this.cells[lastIndex];
    var p1 = c1.getCenter(), p2 = c2.getCenter();
    this.dc.lineWidth = this.PIECE_WEIGHT * 2;
    this.dc.drawPath("#f00", function (dc) { dc.line(p1.x, p1.y, p2.x, p2.y); });
  },

  drawSquare: function (index, piece) {
    var self = this;
    var cell = this.cells[index];
    this.dc.lineWidth = this.PIECE_WEIGHT;
    if (piece == Player.X) {
      function drawX(dc, r, wt) {
        dc.line(r.topLeft.x + wt, r.topLeft.y + wt, r.bottomRight.x - wt, r.bottomRight.y - wt);
        dc.line(r.topLeft.x + wt, r.bottomRight.y - wt, r.bottomRight.x - wt, r.topLeft.y + wt);
      }
      this.dc.drawPath("#0f0", function (dc) { drawX(dc, cell, self.PIECE_WEIGHT * 2); });
    } else if (piece == Player.O) {
      this.dc.drawPath("#00f", function (dc) {
        var radius = Math.floor((self.cellWidth - self.PIECE_WEIGHT * 2) / 2);
        var pos = cell.getCenter();
        dc.arc(pos.x, pos.y, radius, 0, Math.PI * 2, false);
      });
    }
  }
}


function Game() {
  this.turn = 0;
  this.winner = Player.NONE;
  this.winPath = -1;
  this.board = [Player.NONE, Player.NONE, Player.NONE,
    Player.NONE, Player.NONE, Player.NONE,
    Player.NONE, Player.NONE, Player.NONE,
  ];
}
Game.prototype = {
  isDone: function () { return this.turn == 9 || this.winner != Player.NONE; },
  isAvailable: function (idx) { return this.board[idx] == Player.NONE; },
  nextPlayer: function () { return this.turn % 2 == 0 ? Player.X : Player.O; },
}

function Score() {
  function supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  if (supports_html5_storage()) {
    this.hasStorage = true;
    this.getItem = function (name) { return localStorage.getItem(name); }
    this.setItem = function (name, value) { localStorage.setItem(name, value); }
    //this.getItem = localStorage.getItem;
    //this.setItem = localStorage.setItem;
    if (this.getItem(this.TYPE.WIN) === null) { this.clear(); }
  } else {
    this.hasStorage = false;
    this.tempStore = {};
    this.getItem = function (name) { return this.tempStore[name]; }
    this.setItem = function (name, value) { this.tempStore[name] = value; }
    this.clear();
  }

}
Score.prototype = {
  TYPE: { WIN: "ttt.win", LOSS: "ttt.loss", TIE: "ttt.tie" },
  get: function (type) { return parseInt(this.getItem(type)); },
  add: function (type) { this.setItem(type, this.get(type) + 1); },
  clear: function () {
    this.setItem(this.TYPE.WIN, 0);
    this.setItem(this.TYPE.LOSS, 0);
    this.setItem(this.TYPE.TIE, 0);
  },
}

var Controller = {
  paths: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [6, 4, 2],],

  init: function () {
    var self = this;
    function click(e) {
      if (!self.game.isDone()) {
        var pos = self.getClickPos(e);
        pos.x -= self.view.canvas.offsetLeft;
        pos.y -= self.view.canvas.offsetTop;
        self.processClick(pos);
      }
    }
    this.view = new View();
    this.score = new Score();
    this.view.canvas.addEventListener("click", click, false);
    this.newGame();
  },

  newGame: function () {
    this.view.clear();
    this.game = new Game();
    this.updateStatus();
  },

  clearScore: function () {
    this.score.clear();
    this.updateStatus();
  },

  updateStatus: function () {
    function getGameMsg(g) {
      if (!g.isDone()) { return "turn: " + g.turn; }
      if (g.winner == Player.X) { return "X wins."; }
      if (g.winner == Player.O) { return "O wins."; }
      return "tie game";
    }
    function getStats(s) {
      return "" + s.get(s.TYPE.WIN) + " won, "
        + s.get(s.TYPE.LOSS) + " lost, "
        + s.get(s.TYPE.TIE) + " tied";
      // + " " + s.hasStorage;
    }

    // this.view.setStatus(getGameMsg(this.game) + "<br/>" + getStats(this.score));
    this.view.setStatus(getStats(this.score));
  },

  processClick: function (pos) {
    if (this.game.isDone()) { return; }

    var self = this;

    function processMove(cellIdx) {
      self.view.drawSquare(cellIdx, self.game.nextPlayer());
      self.takeTurn(cellIdx);
      self.updateStatus();
      if (self.game.isDone()) {
        if (self.game.winPath != -1) {
          var p = self.paths[self.game.winPath];
          self.view.markWin(p[0], p[2]);
        }
        return true;
      }
      return false;
    }

    var cellIdx = this.view.getCellForPos(pos);
    if (cellIdx != -1 && this.game.isAvailable(cellIdx)) {
      if (!processMove(cellIdx)) {
        var compMove = this.getBestMove(this.game.nextPlayer());
        processMove(compMove);
      }
    }
  },

  getClickPos: function (e) {
    var isPage = (e.pageX != undefined && e.pageY != undefined);
    var x = isPage ? e.pageX : e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = isPage ? e.pageY : e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    return new Pos(x, y);
  },

  getWinPathForPlayer: function (player) {
    for (var i = 0; i < this.paths.length; i++) {
      var path = this.paths[i];
      var b = this.game.board;
      if (b[path[0]] == player && b[path[1]] == player && b[path[2]] == player) { return i; }
    }
    return -1;
  },

  takeTurn: function (idx) {
    if (!this.game.isDone()) {
      var player = this.game.nextPlayer();
      this.game.board[idx] = player;
      this.game.winPath = this.getWinPathForPlayer(player);
      if (this.game.winPath != -1) {
        this.game.winner = player;
        this.score.add(player == Player.X ? this.score.TYPE.WIN : this.score.TYPE.LOSS);
      } else {
        this.game.turn++;
        if (this.game.isDone()) { this.score.add(this.score.TYPE.TIE); }
      }
    }
  },

  getBestMove: function (player) {
    var block = -1, win = -1, rmove = -1;
    var other = (player == Player.X) ? Player.O : Player.X;
    var count = 0;
    for (var i = 0; i < 9; i++) {
      if (this.game.board[i] == Player.NONE) {
        if (++count == 1 || (Math.random() < 1.0 / count)) { rmove = i; }
        this.game.board[i] = player; if (this.getWinPathForPlayer(player) != -1) { win = i; }
        this.game.board[i] = other; if (this.getWinPathForPlayer(other) != -1) { block = i; }
        this.game.board[i] = Player.NONE;
      }
    }
    return (win != -1) ? win : (block != -1) ? block : rmove;
  },


}


function newGame() { Controller.newGame(); }

function clearScore() {
  var ans = confirm("Are you sure you want to clear your history?")
  if (ans) {
    Controller.clearScore();
  }
}
Controller.init();
