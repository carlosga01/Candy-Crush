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

function moveCandyAtInput(direction) {
	var pos = document.getElementById("text").value;

	var mapping = {"a":1, "b":2, "c":3, "d":4, "e":5, "f":6, "g":7, "h":8}

	var row = pos.charAt(1)-1;
	var col = mapping[pos.charAt(0)]-1;

	var candy = board.getCandyAt(row, col);

	if (rules.isMoveTypeValid(candy, direction)) {
		var otherCandy = board.getCandyInDirection(candy, direction);
		board.flipCandies(candy, otherCandy);

		document.getElementById("text").disabled = true;
		document.getElementById("crush").className = "crush-on";
		document.getElementById("crush").disabled = false;
	}

	disableDirectionButtons(["up", "left", "right", "down"]);

}

function getFileFromColor(color) {
	var file;
	switch (color) {
		case "blue":
			file = "blue-candy.png"
			break;
		case "green":
			file = "green-candy.png"
			break;
		case "orange":
			file = "orange-candy.png"
			break;
		case "yellow":
			file = "yellow-candy.png"
			break;
		case "red":
			file = "red-candy.png"
			break;
		case "purple":
			file = "purple-candy.png"
			break;
	}

	return file;
}

function generateGrid(size) {
	for (var i=0; i < size; ++i) {
		for (var j=0; j < size; ++j) {
			var img = document.createElement("img");

			var cell = document.createElement("div");

			cell.className = "cell";
			cell.id = j+"-"+i;
			cell.style = "grid-area:"+j+1+"/"+i+1+";";

			cell.appendChild(img);
			document.getElementById("board").appendChild(cell);
		}
	}
}

function generateHeaders(size) {
	for (var i=1; i <= size; ++i) {
		var cell = document.createElement("div");
		cell.style = "grid-area:1/"+i+";";
		cell.className = "header";
		var mapping = {1:"a", 2:"b", 3:"c", 4:"d", 5:"e", 6:"f", 7:"g", 8:"h"}
		cell.innerHTML = "<br>" + mapping[i];
		document.getElementById("letter-head").appendChild(cell);
	}
	for (var i=1; i <= size+1; ++i) {
		var cell2 = document.createElement("div");
		cell2.style = "grid-area:"+i+"/1;";
		cell2.className = "header";
		if (i == 1) {
			cell2.innerHTML = " ";
		} else {
			var j = i-1;
			cell2.innerHTML ="<br>" + j;
		}
		document.getElementById("number-head").appendChild(cell2);
	}

}

function crushAndDrop() {
	rules.removeCrushes(rules.getCandyCrushes());
	setTimeout(rules.moveCandiesDown, 500);
	setTimeout(this.waitWhileDropping, 500);

}

function waitWhileDropping() {
	document.getElementById("text").disabled = false;

	document.getElementById("text").value = "";
	document.getElementById("text").focus();

	if (rules.getCandyCrushes() == 0) {
		document.getElementById("crush").className = "crush-off";
		document.getElementById("crush").disabled = true;
	}
}

function getValidDirections(row, col) {
	var directions = ["up", "left", "right", "down"];
	var valid = [];
	var candy = board.getCandyAt(row, col);

	for (var i=0; i<directions.length; ++i) {
		var opt = directions[i];

		if (rules.isMoveTypeValid(candy, opt)) {
			valid.push(opt);
		}
	}
	return valid;
}

function enableDirectionButtons(valid) {
	for (var i=0; i<valid.length; ++i) {
		var dir = valid[i];

		document.getElementById(dir).disabled = false;
		document.getElementById(dir).className = "control-button-on";
	}
}

function disableDirectionButtons(invalid) {
	for (var i=0; i<invalid.length; ++i) {
		var dir = invalid[i];

		document.getElementById(dir).disabled = true;
		document.getElementById(dir).className = "control-button-off";
	}
}

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
		Util.one("#newgame").addEventListener("click", generateGrid(size));
		Util.one("#newgame").addEventListener("click", generateHeaders(size));
		Util.one("#newgame").addEventListener("click", rules.prepareNewGame());

	},

	// Keyboard events arrive here
	"keyup": function(evt) {
		var text = document.getElementById("text").value;

		if (text.length == 2) {
			var mapping = {"a":1, "b":2, "c":3, "d":4, "e":5, "f":6, "g":7, "h":8};
			var numbers = [1,2,3,4,5,6,7,8];

			var char = text.charAt(0);
			var num = text.charAt(1);

			if ((char in mapping) && (num in numbers)) {
				var row = num -1;
				var col = mapping[char] -1;
				validDirections = getValidDirections(row, col);
				enableDirectionButtons(validDirections);
			}
		} else {
			disableDirectionButtons(["up", "left", "right", "down"]);
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

		var color = e.detail.candy.color;

		var file = getFileFromColor(color);

		var row = parseInt(e.detail.toRow);
		var col = parseInt(e.detail.toCol);

		var cell = document.getElementById(row+"-"+col);

		var img = cell.getElementsByTagName("img")[0];

		img.src = "graphics/" + file;
		img.className = "candy";
	},

	// move a candy from location 1 to location 2
	"move": function(e) {
		var colorToApply = e.detail.candy.color;

		var file = getFileFromColor(colorToApply);

		var toRow = parseInt(e.detail.toRow);
		var toCol = parseInt(e.detail.toCol);

		var toDiv = document.getElementById(toRow+"-"+toCol);

		toDiv.getElementsByTagName('img')[0].src = "graphics/" + file;

	},

	// remove a candy from the board
	"remove": function(e) {
		var row = parseInt(e.detail.fromRow);
		var col = parseInt(e.detail.fromCol);

		var cell = document.getElementById(row+"-"+col);
		var img = cell.getElementsByTagName("img")[0];

		img.src = "graphics/white.png";
	},

	// update the score
	"scoreUpdate": function(e) {
		// Your code here. To be implemented in PS3.
	},
});
