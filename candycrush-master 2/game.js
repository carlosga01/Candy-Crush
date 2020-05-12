// Hand it in this way: for simpler testing, always use the same seed.
Math.seedrandom(0);

// constants
const DEFAULT_BOARD_SIZE = 8;
// set size from URL or to default
const size = Math.min(10, Math.max(3, +Util.getURLParam("size") || DEFAULT_BOARD_SIZE));
document.documentElement.style.setProperty('--size', '' + size);
document.documentElement.style.setProperty('--full-grid', '' + (size+1));

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};

var hintTimer = 0;
var prevX = 0;
var prevY = 0;

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
        dom.board = Util.one("#center");
        dom.score = Util.one("#score");
        dom.points = Util.one("#points")
        dom.scoreColor = Util.one("#scoreboard");
        dom.coordinate = Util.one("#coordinate");
        dom.help = Util.one("#help");

        createGrid();

        rules.prepareNewGame();

        // Add events
        Util.one("#newgame").addEventListener("click",
            function() {
                removeHint();
                rules.prepareNewGame();
                dom.scoreColor.style.backgroundColor = "var(--color-light-gray)";
                dom.score.innerHTML = "0"
                Util.one("#crush").disabled = true;
                Util.one("#crush").className = "btn";
                dom.coordinate.disabled = false;
                dom.coordinate.focus();
                dom.coordinate.value = "";
                var directions = ["left", "right", "up", "down"];
                for (i = 0; i < directions.length; i++) {
                    direction = directions[i];
                    var button = Util.one("#" + direction + "btn");
                    button.disabled = true;
                    button.className = "btn";
            	}
    			clearTimeout(hintTimer);
    			hintTimer = setTimeout(showHint, 5000);
            });
    },

    "mousedown": function(evt) {
    	var element = document.elementFromPoint(evt.clientX, evt.clientY);
    	removeHint();
    	clearTimeout(hintTimer);
    	if (element.tagName == "SPAN") {
    		element = element.firstChild
    	}
    	if (element.className == "candy") {
	    	element.className = "candy-drag"
	    	prevX = evt.clientX
	    	prevY = evt.clientY
	    	document.documentElement.style.setProperty('--top', 0 + 'px')
	    	document.documentElement.style.setProperty('--left', 0 + 'px')
			element.ondragstart = function() {return false;}
    	}
    },
    "mouseup": function(evt) {
    	clearTimeout(hintTimer)
    	var candy = Util.one(".candy-drag");
    	if (candy != null) {
	    	var otherCandy = document.elementFromPoint(evt.clientX, evt.clientY);
	    	if (otherCandy.tagName == "IMG") {
	    		otherCandy = otherCandy.parentElement
	    	}
	    	if (otherCandy.tagName == "SPAN") {
	    	var candyParent = candy.parentElement
	    	var fromCandy = board.getCandyAt(candyParent.id.slice(0,1), candyParent.id.slice(2,3))
	    	var toCandy = board.getCandyAt(otherCandy.id.slice(0,1), otherCandy.id.slice(2,3))
	    	var directions = ["left", "right", "up", "down"];
            for (i = 0; i < directions.length; i++) {
                direction = directions[i];
                if (board.getCandyInDirection(fromCandy, direction) == toCandy) {
                	if (rules.isMoveTypeValid(fromCandy, direction)) {
                		board.flipCandies(fromCandy, toCandy)
                		crushCandy()
                		return
                	}
                	else {
                		board.flipCandies(fromCandy, toCandy);
                		setTimeout(function() {board.flipCandies(toCandy, fromCandy)}, 300)
                		return
                	}
                }
			}

			}
    		candy.className = "candy-move-back"
    		var promise = Util.afterAnimation(candy, "moveBack")
    		promise.then( function() {
        		candy.className = "candy";
    			hintTimer = setTimeout(showHint, 5000);
        	})
    	
    }
    },
    "mousemove": function(evt) {
    	var element = Util.one(".candy-drag");
    	if (element != null) {
	    	document.documentElement.style.setProperty('--top', (evt.clientY - prevY) + 'px')
	    	document.documentElement.style.setProperty('--left', (evt.clientX - prevX) + 'px')	
		}
    }
});

// Attaching events to the board
Util.events(board, {
    // add a candy to the board
    "add": function(e) {
        var fromRow = e.detail.fromRow;
        var row = e.detail.toRow;
        var col = e.detail.toCol;
        var cell = Util.one("[id='" + row + "," + col + "']");
        var image = cell.firstChild;
        image.className = "candy";
        image.src = "graphics/" + e.detail.candy.color + "-candy.png";
        var amount = row - fromRow;
        document.documentElement.style.setProperty('--multiplier', '' + amount);
        image.className = "candy-move-down"
        var promise = Util.afterAnimation(image, "moveCandy");

        promise.then(function() {
            image.className = "candy";
            document.documentElement.style.setProperty('--multiplier', '' + 1);
            crushCandy()
        })
    },

        

    // move a candy from location 1 to location 2
    "move": function(e) {
        var row1 = e.detail.fromRow;
        var col1 = e.detail.fromCol;
        var row2 = e.detail.toRow;
        var col2 = e.detail.toCol;
        var cell2 = Util.one("[id='" + row2 + "," + col2 + "']");
        var image = cell2.firstChild;
        image.className = "candy"
        image.src = "graphics/" + e.detail.candy.color + "-candy.png";
        if (row2 - row1 == 1) {
            image.className = "candy-move-down";
        }
        else if (row2 - row1 == -1) {
            image.className = "candy-move-up";
        }
        else if (col2 - col1 == 1) {
            image.className = "candy-move-right";
        }
        else if (col2 - col1 == -1) {
            image.className = "candy-move-left"
        }
        else if (row2-row1 >+ 1) {
            var amount = row2-row1;
            document.documentElement.style.setProperty('--multiplier', '' + amount);
            image.className = "candy-move-down"
        }
        var promise = Util.afterAnimation(image, "moveCandy");

        promise.then(function() {
            image.className = "candy";
            document.documentElement.style.setProperty('--multiplier', '' + 1);
            crushCandy();
        })

    },

    // remove a candy from the board
    "remove": function(e) {
        var row = e.detail.fromRow;
        var col = e.detail.fromCol;
        var cell = Util.one("[id='" + row + "," + col + "']");
        var image = cell.firstChild;
    	if (image.className == "candy-move-down") {
    		var promise = Util.afterAnimation(image, "moveCandy");
        	promise.then(function() {
        		image.className = "candy-remove";
        	})
    	}
        image.className = "candy-remove";
    },

    // update the score
    "scoreUpdate": function(e) {
        var score = e.detail.score;
        var color = e.detail.candy.color;
        dom.score.innerHTML = score;
        dom.scoreColor.style.backgroundColor = "var(--color-" + color + ")";
        if (color == "yellow"){
            dom.score.style.color = "black";
            dom.points.style.color = "black";
        }
        else {
            dom.score.style.color = "white"
            dom.points.style.color = "white";
        }

    },
});

function createGrid() {
    var labels = " abcdefghij"
    var size = board.getSize();
    for (i = 0; i < size + 1; i++) {
        for (j = 0; j < size + 1; j++) {
            if (i == 0) {
                var label = labels.charAt(j);
                var cell = document.createElement("span");
                if (j==0) {
                    cell.className = "label";
                }
                else {
                    cell.className = "label letter";
                }
                cell.innerHTML = label;
                cell.style.setProperty("--grid-column-start", "" + (j+1))
                cell.style.setProperty("--grid-row-start", "" + (i+1))
                cell.style.setProperty("--grid-column-end", "" + (j+2))
                cell.style.setProperty("--grid-row-end", "" + (i+2))
                dom.board.appendChild(cell);
            } else if (j == 0) {
                var label = labels.charAt(j);
                var cell = document.createElement("span");
                cell.className = "label number";
                cell.innerHTML = "" + i;
                cell.style.setProperty("--grid-column-start", "" + (j+1))
                cell.style.setProperty("--grid-row-start", "" + (i+1))
                cell.style.setProperty("--grid-column-end", "" + (j+2))
                cell.style.setProperty("--grid-row-end", "" + (i+2))
                dom.board.appendChild(cell);
            } else {
                var cell = document.createElement("span");
                cell.className = "cell";
                cell.id = (i - 1) + "," + (j - 1);
                cell.style.setProperty("--grid-column-start", "" + (j+1))
                cell.style.setProperty("--grid-row-start", "" + (i+1))
                cell.style.setProperty("--grid-column-end", "" + (j+2))
                cell.style.setProperty("--grid-row-end", "" + (i+2))
                var image = document.createElement("img")
                image.className = "candy"
                cell.appendChild(image)
                dom.board.appendChild(cell);
            }
        }
    }
    clearTimeout(hintTimer);
    hintTimer = setTimeout(showHint, 5000);
}


function crushCandy() {
	clearTimeout(hintTimer);
    var candies = rules.getCandyCrushes()
    if (candies.length > 0) {
	    rules.removeCrushes(candies);
	    setTimeout(function() {
	        rules.moveCandiesDown();
	    }, 500);
	}
    hintTimer = setTimeout(showHint, 5000);
}
function showHint() {
    var hint = rules.getRandomValidMove();
    var possibleCrushes = rules.getCandiesToCrushGivenMove(hint.candy, hint.direction)
    for (i = 0; i<possibleCrushes.length; i++) {
        var row = possibleCrushes[i].row;
        var col = possibleCrushes[i].col;
        var cell = Util.one("[id='" + row + "," + col + "']");
        var image = cell.firstChild;
        image.className = "candy-hint";       
    }
}

function removeHint() {
    var hints = Util.all(".candy-hint");
    for (i = 0; i<hints.length; i++) {
        var candy = hints[i];
        candy.className = "candy";
    }

}