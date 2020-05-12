// Hand it in this way: for simpler testing, always use the same seed.
Math.seedrandom(0);

// constants
const DEFAULT_BOARD_SIZE = 8;
// set size from URL or to default
const size = Math.min(10, Math.max(3, Util.getURLParam("size") || DEFAULT_BOARD_SIZE));

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};
var timer = 0;

// data model at global scope for easier debugging
// initialize board model
var board = new Board(size);

// load a rule
var rules = new Rules(board);

function translateCandyAtInput(direction) {
	resetAllCandiesToDefault()
	var pos = document.getElementById("text").value;

	var mapping = {"a":1, "b":2, "c":3, "d":4, "e":5, "f":6, "g":7, "h":8, "i":9, "j":10}

	var row;
	var col = mapping[pos.charAt(0)]-1;

	var num;
	if (pos.length == 2) {
		row = pos.charAt(1)-1;
	} else if (pos.length == 3) {
		row = parseInt(pos.slice(1,3))-1;
	}

	var candy = board.getCandyAt(row, col);

	document.getElementById(row + "-" + col).style.backgroundColor = "";

	if (rules.isMoveTypeValid(candy, direction)) {
		var otherCandy = board.getCandyInDirection(candy, direction);
		board.flipCandies(candy, otherCandy);

	}

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
	document.documentElement.style.setProperty("--size", size+1)

	var cell = document.createElement("div");
	cell.style = "grid-area:0/0";
	cell.className = "cell-head";
	document.getElementById("board").appendChild(cell);


	for (var i=0; i < size; ++i) {
		for (var j=0; j < size; ++j) {
			var img = document.createElement("img");
			img.id = j+"-"+i+"img";
			var cell = document.createElement("div");

			if (i == 0 && j == 0) {
				cell.className = "cell-topleft";
			} else if (i == 0) {
				cell.className = "cell-left";
			} else if (j == 0) {
				cell.className = "cell-top";
			} else {
				cell.className = "cell-middle";
			}

			cell.id = j+"-"+i;

			h = i+1;
			k = j+1;
			cell.style = "grid-area:"+k+"/"+h+";";

			cell.appendChild(img);
			document.getElementById("board").appendChild(cell);
		}
	}
}


function crushAndDrop() {
		clearTimeout(timer);
		var candies = rules.getCandyCrushes()
		if (candies.length > 0) {
			rules.removeCrushes(candies);
			setTimeout(function() {
					rules.moveCandiesDown();
			}, 500);
	}
		timer = setTimeout(showAndAnimateHint, 5000);
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


function createNewGame() {
	board.resetScore()

	rules.prepareNewGame()
}

function resetAllCandiesToDefault() {
	for (var i=0; i < size; ++i) {
		for (var j=0; j < size; ++j) {
			let imgId = j+"-"+i+"img";
			document.getElementById(imgId).className = "candy";
		}
	}
}


function checkForHintAnimations() {
	for (var i=0; i < size; ++i) {
		for (var j=0; j < size; ++j) {
			let candyImg = document.getElementById(j+"-"+i+"img")
			if (candyImg.classList.length > 1) {
				return true;

			}
		}
	}
	return false;
}

function removeAllAnimations() {
	for (var i=0; i < size; ++i) {
		for (var j=0; j < size; ++j) {
			let candyImg = document.getElementById(j+"-"+i+"img")
			candyImg.className = "candy";
		}
	}
}

function showAndAnimateHint() {
		if (!checkForHintAnimations()) {
			let random = rules.getRandomValidMove();
			let candy = random.candy;
			let dir = random.direction;

			var affected = rules.getCandiesToCrushGivenMove(candy, dir);

			resetAllCandiesToDefault()
			for (var i=0; i < affected.length; ++i) {
				let currentCandy = affected[i];
				let col = currentCandy.row
				let row = currentCandy.col

				let candyImg = document.getElementById(col + "-" + row + "img")

				candyImg.classList.add('animated')

			}

		} else {
			removeAllAnimations();
		}

}

function checkDrag(candyParent, fromCandy, toCandy) {
	var dir = ["left", "right", "up", "down"]
	for (i = 0; i < dir.length; i++) {
			cur_dir = dir[i];

			var isToCandy = board.getCandyInDirection(fromCandy, cur_dir) == toCandy
			if (isToCandy) {

				var isValid = rules.isMoveTypeValid(fromCandy, cur_dir)
				if (isValid) {

					board.flipCandies(fromCandy, toCandy)
					crushAndDrop()
					return;
				}
				else {
					board.flipCandies(fromCandy, toCandy);
					setTimeout(function() {board.flipCandies(toCandy, fromCandy)}, 300)
					return;
				}
			}
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
		Util.one("#newgame").addEventListener("click", createNewGame());


		Util.one("#newgame").addEventListener("click",
			function() {

				createNewGame()

				clearTimeout(timer);
				timer = setTimeout(showAndAnimateHint, 5000);

			});


	},

	"mousedown": function(evt) {
		var elt = document.elementFromPoint(evt.clientX, evt.clientY);
		removeAllAnimations();
		clearTimeout(timer);

		if (elt.className == "candy") {
			elt.className = "drag"
			prevX = evt.clientX
			prevY = evt.clientY
			document.documentElement.style.setProperty('--top', 0 + 'px')
			document.documentElement.style.setProperty('--left', 0 + 'px')

		elt.ondragstart = function() {return false;}
		}
	},

	"mouseup": function(evt) {
		clearTimeout(timer)
		var candy = Util.one(".drag");
		if (candy != null) {
			x = evt.clientX
			y = evt.clientY

			var other = document.elementFromPoint(x, y);

			if (other.tagName == "IMG") {
				var candyParent = candy.parentElement

				let parentSlice1 = candyParent.id.slice(0,1)
				let parentSlice2 = candyParent.id.slice(2,3)
				var fromCandy = board.getCandyAt(parentSlice1, parentSlice2)

				let otherSlice1 = other.id.slice(0,1)
				let otherSlice2 = other.id.slice(2,3)
				var toCandy = board.getCandyAt(otherSlice1, otherSlice2)

				checkDrag(candyParent, fromCandy, toCandy);

		}

			candy.className = "return-candy"
			var promise = Util.afterAnimation(candy, "returnCandy")
			promise.then( function() {
					candy.className = "candy";
				timer = setTimeout(showAndAnimateHint, 5000);
				})

	}
	},
	
	"mousemove": function(evt) {
		var elt = Util.one(".drag");
		if (elt != null) {
			document.documentElement.style.setProperty('--top', (evt.clientY - prevY) + 'px')
			document.documentElement.style.setProperty('--left', (evt.clientX - prevX) + 'px')
		}
	}


});

// Attaching events to the board
Util.events(board, {
	// add a candy to the board
	"add": function(e) {



		var color = e.detail.candy.color;

		var file = getFileFromColor(color);

		var toRow = parseInt(e.detail.toRow);
		var toCol = parseInt(e.detail.toCol);
		var fromRow = parseInt(e.detail.fromRow);
		var fromCol = parseInt(e.detail.fromCol);

		var cell = document.getElementById(toRow+"-"+toCol);

		var img = document.getElementById(toRow+"-"+toCol+"img");


		img.src = "graphics/" + file;
		img.className = "candy";

		var dist = toRow - fromRow;
		document.documentElement.style.setProperty('--alpha', '' + dist);
		img.className = "move-down"
		var promise = Util.afterAnimation(img, "translateCandy");

		promise.then(function() {
				img.className = "candy";
				document.documentElement.style.setProperty('--alpha', '' + 1);
				crushAndDrop()
		})

	},

	// move a candy from location 1 to location 2
	"move": function(e) {
		var colorToApply = e.detail.candy.color;

		var file = getFileFromColor(colorToApply);

		var toRow = parseInt(e.detail.toRow);
		var toCol = parseInt(e.detail.toCol);

		var fromRow = parseInt(e.detail.fromRow)
		var fromCol = parseInt(e.detail.fromCol)


		var fromImg = document.getElementById(fromRow+"-"+fromCol+"img");

		var toImg = document.getElementById(toRow+"-"+toCol+"img");
		toImg.src = "graphics/" + file;

		dRow = toRow - fromRow;
		cCol = toCol - fromCol;
		var name = "";
		if (dRow == 1) {
			name = "move-down"

		} else if (dRow == -1) {
			name = "move-up"

		} else if (dCol == 1) {
			name = "move-right"

		} else if (dCol == -1) {
			name = "move-left"

		} else if (dRow >+ 1) {
				var dist = toRow - fromRow;
				document.documentElement.style.setProperty('--alpha', '' + dist);
				name = "move-down"
		}
		if (name != "") {
			toImg.className = name;
		}

		var promise = Util.afterAnimation(toImg, "translateCandy");

		promise.then(function() {
				toImg.className = "candy";
				document.documentElement.style.setProperty('--alpha', '' + 1);
				crushAndDrop();
		})


	},

	// remove a candy from the board
	"remove": function(e) {
		var row = parseInt(e.detail.fromRow);
		var col = parseInt(e.detail.fromCol);

		var cell = document.getElementById(row+"-"+col);
		var img = document.getElementById(row+"-"+col+"img");

		if (img.className == "move-down") {
			var promise = Util.afterAnimation(img, "translateCandy");
				promise.then(function() {
					img.className = "fadeaway";
				})
		}
			img.className = "fadeaway";

	},

	// update the score
	"scoreUpdate": function(e) {
			let curScore = board.getScore();

			document.getElementById("score").innerHTML = curScore;

			let color = "silver"

			try {
				color = e.detail.candy.color;
			}
			catch (err) {
			}

			switch (color) {
				case "blue":
					style = "var(--color-blue)"
					break;
				case "green":
					style = "var(--color-green)"
					break;
				case "orange":
					style = "var(--color-orange)"
					break;
				case "yellow":
					style = "var(--color-yellow)"
					break;
				case "red":
					style = "var(--color-red)"
					break;
				case "purple":
					style = "var(--color-purple)"
					break;
				case "silver":
					style = "silver"
					break;
			}

			document.getElementById("score-box").style.backgroundColor = style;

	},
});
