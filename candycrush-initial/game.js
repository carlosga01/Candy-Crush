// Hand it in this way: for simpler testing, always use the same seed.
Math.seedrandom(0);

// constants
const DEFAULT_BOARD_SIZE = 8;
// set size from URL or to default
const size = Math.min(10, Math.max(3, Util.getURLParam("size") || DEFAULT_BOARD_SIZE));

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};

// data model at global scope for easier debugging
// initialize board model
var board = new Board(size);

// load a rule
var rules = new Rules(board);



// Attaching events on document because then we can do it without waiting for
// the DOM to be ready (i.e. before DOMContentLoaded fires)
Util.events(document, {
	// Final initalization entry point: the Javascript code inside this block
	// runs at the end of start-up when the DOM is ready
	"DOMContentLoaded": function() {
		// Your code here

		// Element refs
		dom.controlColumn = Util.one("#controls"); // example

		// Add events
		Util.one("#newgame").addEventListener("click", rules.prepareNewGame());
		Util.one("#newgame").addEventListener("click", board.makeHeaders());



	},

	// Keyboard events arrive here
	"keydown": function(evt) {

	},

	"keyup": function(evt){

		//check text box to see if there is a valid input
		var pos = document.getElementById("text").value;

		if (pos.length == 2) {

			var mapping = {"a":1, "b":2, "c":3, "d":4, "e":5, "f":6, "g":7, "h":8};
			var numbers = [1,2,3,4,5,6,7,8];

			if ((pos.charAt(0) in mapping) && (pos.charAt(1) in numbers)) {

				var row = pos.charAt(1)-1;
				var col = mapping[pos.charAt(0)]-1;


				var candy = board.getCandyAt(row, col);

				options = ["up", "left", "right", "down"];
				for (i = 0; i < options.length; ++i) {
					var opt = options[i];
					if (rules.isMoveTypeValid(candy, opt)) {
						document.getElementById(opt).disabled = false;
						document.getElementById(opt).className = "control-button";

					} else {
						document.getElementById(opt).disabled = true;
						document.getElementById(opt).className = "control-button-off";

					}
				}
			}


		} else {
			options = ["up", "left", "right", "down"];
			for (i = 0; i < options.length; ++i) {
				var opt = options[i];
				document.getElementById(opt).disabled = true;
				document.getElementById(opt).className = "control-button-off";
			}
		}

	},

	// Click events arrive here
	"click": function(evt) {

	}
});

// Attaching events to the board
Util.events(board, {
	// add a candy to the board
	"add": function(e) {
		var cell = document.createElement("div");

		var color = e.detail.candy.color;

		var candy_img;
		switch (color) {
			case "blue":
				candy_img = "blue-candy.png";
				break;
			case "green":
				candy_img = "green-candy.png";
				break;
			case "orange":
				candy_img = "orange-candy.png";
				break;
			case "purple":
				candy_img = "purple-candy.png";
				break;
			case "red":
				candy_img = "red-candy.png";
				break;
			case "yellow":
				candy_img = "yellow-candy.png";
				break;
		}

		var row = parseInt(e.detail.toRow) + 2;
		var col = parseInt(e.detail.toCol) + 2;

		cell.className = "cell4";

		cell.innerHTML = '<img class="candy" src="graphics/' + candy_img + '">';


		cell.id = row + "-" + col;

		cell.style = "grid-area: " + row + "/" + col + ";";

		document.getElementById('board').appendChild(cell);

	},

	// move a candy from location 1 to location 2
	"move": function(e) {

		// var fromRow = parseInt(e.detail.fromRow)+2;
		// var fromCol = parseInt(e.detail.fromCol)+2;
		//
		// var toRow = parseInt(e.detail.toRow)+2;
		// var toCol = parseInt(e.detail.toCol)+2;
		//
		// document.getElementById(fromRow + "-" + fromCol).style = "grid-area: " + toRow + "/" + toCol + ";";
		// document.getElementById(fromRow + "-" + fromCol).id = toRow + "-" + toCol;


		var fromCol = e.detail.fromCol;
		var fromRow = e.detail.fromRow;

		var toCol = e.detail.toCol;
		var toRow = e.detail.toRow;

		var detail = {
			fromRow: fromRow,
			fromCol: fromCol
		};

		this.dispatchEvent(new CustomEvent("remove", {detail}));

		var candyNew = board.getCandyAt(parseInt(toRow), parseInt(toCol));

		var detail = {
			candy: candyNew,
			toRow: toRow,
			toCol: toCol,
		};

		this.dispatchEvent(new CustomEvent("add", {detail}));

	},

	// remove a candy from the board
	"remove": function(e) {
		var row = parseInt(e.detail.fromRow) + 2;
		var col = parseInt(e.detail.fromCol) + 2;

		var parent = document.getElementById('board');
		var cell = document.getElementById(row + "-" + col);

		parent.removeChild(cell);

	},

	// update the score
	"scoreUpdate": function(e) {
		// Your code here. To be implemented in PS3.
	},
});
