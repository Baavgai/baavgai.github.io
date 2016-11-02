
function getSillyName() {
  var pick = function (xs) { return xs[Math.floor(Math.random() * xs.length)]; };
  var x = pick(["Snicker", "Buffalo", "Gross", "Bubble", "Sheep", "Corset",
    "Toilet", "Lizard", "Waffle", "Kumquat", "Burger", "Chimp", "Liver",
    "Gorilla", "Rhino", "Emu", "Pizza", "Toad", "Gerbil", "Pickle", "Tofu",
    "Chicken", "Potato", "Hamster", "Lemur", "Vermin"]);
  return x + pick(["face", "dip", "nose", "brain", "head", "breath", "pants",
    "shorts", "lips", "mouth", "muffin", "butt", "bottom", "elbow", "honker", "toes",
    "buns", "spew", "kisser", "fanny", "squirt", "chunks", "brains", "wit", "juice", "shower"]);
}


$( document ).ready(function() {
  var updateName = function() { $( "#showname" ).text(getSillyName()); }
  $( "#b1" ).bind( "click", updateName);
  updateName();
});    
