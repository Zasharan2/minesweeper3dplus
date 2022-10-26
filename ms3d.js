// minesweeper3D
 
// getting canvas and context
var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");
 
// disable right click context menu on canvas
c.addEventListener('contextmenu', (event)=>{
    event.preventDefault();
});
 
// key event listeners
window.addEventListener("keydown", this.keyPressed, false);
window.addEventListener("keyup", this.keyReleased, false);
 
// define keys list
var keys = [];
 
// key functions
function keyPressed(event){
    keys[event.keyCode] = true;
}
function keyReleased(event){
    keys[event.keyCode] = false;
}
 
// mouse vars
var mX;
var mY;
 
// mouse event listener
window.addEventListener("mousemove", function(event) {
    mX = event.clientX - c.getBoundingClientRect().left;
    mY = event.clientY - c.getBoundingClientRect().top;
});
 
// click var
var mouseDown;
var mouseButton;
 
// click event listeners
window.addEventListener("mousedown", function(event){
    mouseDown = true;
    mouseButton = event.button;
});
window.addEventListener("mouseup", function(){
    mouseDown = false;
});
 
// wheel var
var wheelDir;
 
// wheel event listener
window.addEventListener("wheel", function(event) {
    wheelDir = event.deltaY;
});
 
// general purpose variables
var screen = 0;
var t = 0;
var boardSize3 = [6, 6, 6]; // [x, y, h]
var boardSize4 = [6, 6, 6, 6]; // [x, y, z, w]
var tileSize = 400 / (6 + 2);
var tileGap = 5;
var bombCount = 40;
var mode2 = 1; // 0 = individual tiles can be scrolled 3D, 1 = whole board is scrolled 3D
var markerMode = 1; // 0 = no markers, 1 = colour markers, 2 = number markers
var dimNum = 3;
 
// screen 0 (title) vars
var t0 = 0;
var optY = 0;
var optDispY = 100;
 
// screen 1 (game) vars
var t1 = 0;
var tile;
var tiles = [[[]]];
var winState = 0; // -1 = lose, 0 = neutral (still playing), 1 = win
var firstClick = true;
 
// screen 2 (settings) vars
var t2 = 0;
 
// main function
function main() {
    t++;
    switch(screen) {

        // title screen
        case 0: {
            t0++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "rgba(200, 200, 200)";
            ctx.fillRect(0, 0, 400, 400);
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 255)";
            ctx.font = "45px Verdana";
            ctx.fillText("Minesweeper", 22, 62);
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 0, 0)";
            ctx.font = "45px Verdana";
            ctx.fillText("3D", 316, 62);

            // cursor
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 255, 255)";
            ctx.fillRect(20, (optDispY), 10, 10);
            optDispY += (((100 + (optY * 30)) - optDispY) / 5);
            if (keys[83] && t0 > 20) {
                optY++;
                t0 = 0;
            }
            if (keys[87] && t0 > 20) {
                optY--;
                t0 = 0;
            }
            if (optY < 0) {
                optY = 2;
            }
            if (optY > 2) {
                optY = 0;
            }
            if (keys[13] && t0 > 20) {
                screen = optY + 1;
                if (screen == 1) {
                    winState = 0;
                    firstClick = true;
                    if (dimNum == 3) {
                        tiles = [[[]]];
                    } else if (dimNum == 4) {
                        tiles = [[[[]]]];
                    }
                    // load board on start
                    setUpBoard();
                } else if (screen == 2) {
                    optY = 0;
                    optDispY = 100;
                }
            }

            // new game option
            ctx.beginPath();
            if (optDispY > 95 && optDispY < 105) {
                ctx.fillStyle = "rgba(255, 255, 255)";
            } else {
                ctx.fillStyle = "rgba(0, 0, 0)";
            }
            ctx.font = "25px Verdana";
            ctx.fillText("New Game", 40, 114);

            // settings option
            ctx.beginPath();
            if (optDispY > 125 && optDispY < 135) {
                ctx.fillStyle = "rgba(255, 255, 255)";
            } else {
                ctx.fillStyle = "rgba(0, 0, 0)";
            }
            ctx.font = "25px Verdana";
            ctx.fillText("Settings", 40, 144);

            // help option
            ctx.beginPath();
            if (optDispY > 155 && optDispY < 165) {
                ctx.fillStyle = "rgba(255, 255, 255)";
            } else {
                ctx.fillStyle = "rgba(0, 0, 0)";
            }
            ctx.font = "25px Verdana";
            ctx.fillText("Help/Info", 40, 174);

            break;
        }

        // game screen
        case 1: {
            t1++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "rgba(200, 200, 200)";
            ctx.fillRect(0, 0, 400, 400);

            switch (dimNum) {
                // 3 dimensions
                case 3: {
                    // render board
                    for (var x = 0; x < boardSize3[0]; x++) {
                        for (var y = 0; y < boardSize3[1]; y++) {
                            if (tiles[x][y][0].state == 0) {
                                // draw unrevealed tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(100, 100, 100)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);

                                // if mouse clicks on tile
                                if (t1 > 20 && mouseDown && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                    if (mouseButton == 2) {
                                        // flag tile (on right click)
                                        tiles[x][y][0].state = 1;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    } else if (mouseButton == 0) {
                                        // reveal tile (on left click)
                                        if (firstClick && tiles[x][y][0].bomb) {
                                            relocateBomb();
                                            tiles[x][y][0].bomb = 0;
                                            firstClick = false;
                                        }
                                        tiles[x][y][0].state = 2;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    }
                                }
                            } else if (tiles[x][y][0].state == 1) {
                                // draw flagged tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(100, 100, 100)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(255, 0, 0)";
                                ctx.font = "45px Verdana";
                                ctx.fillText("F", ((x + 1.18) * tileSize) + (tileGap / 2), ((y + 1.8) * tileSize) + (tileGap / 2));

                                // if mouse clicks on tile
                                if (t1 > 20 && mouseDown && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                    if (mouseButton == 2) {
                                        // unflag tile (on right click)
                                        tiles[x][y][0].state = 0;
                                        t1 = 0;
                                    } else if (mouseButton == 0) {
                                        // reveal tile (on left click)
                                        if (firstClick && tiles[x][y][0].bomb) {
                                            relocateBomb();
                                            tiles[x][y][0].bomb = 0;
                                            firstClick = false;
                                        }
                                        tiles[x][y][0].state = 2;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    }
                                }
                            } else if (tiles[x][y][0].state == 2) {
                                // draw revealed tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(255, 255, 255)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);
                                if (tiles[x][y][0].surrounding != 0 && tiles[x][y][0].surrounding != -1) {
                                    ctx.beginPath();
                                    ctx.fillStyle = "rgba(255, 0, 0)";
                                    ctx.font = "45px Verdana";
                                    ctx.fillText(tiles[x][y][0].surrounding.toString(), ((x + 1.18) * tileSize) + (tileGap / 2), ((y + 1.8) * tileSize) + (tileGap / 2));
                                }
                                if (tiles[x][y][0].surrounding == -1) {
                                    ctx.beginPath();
                                    ctx.fillStyle = "rgba(255, 0, 0)";
                                    ctx.font = "45px Verdana";
                                    ctx.fillText("B", ((x + 1.18) * tileSize) + (tileGap / 2), ((y + 1.8) * tileSize) + (tileGap / 2));
                                    winState = -1;
                                }
                            }

                            if (markerMode == 1) {
                                ctx.beginPath();
                                switch (tiles[x][y][1].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap - 10, ((y + 1) * tileSize) + (tileGap / 2), 10, 10);
                                ctx.beginPath();
                                switch (tiles[x][y][boardSize3[2] - 1].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap - 10, 10, 10);
                            }

                            // handle wheel scroll
                            if (mode2 == 0 && wheelDir != 0 && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                if (wheelDir > 0) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                                calcSurrounding();
                                wheelDir = 0;
                            }
                            if (t1 > 20 && mode2 == 0 && (keys[38] == true || keys[40] == true) && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                if (keys[40] == true) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                                calcSurrounding();
                                t1 = 0;
                            }
                        }
                    }

                    // mode2 = 1 scrolling
                    if (mode2 == 1 && wheelDir != 0) {
                        for (var x = 0; x < boardSize3[0]; x++) {
                            for (var y = 0; y < boardSize3[1]; y++) {
                                if (wheelDir > 0) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                            }
                        }
                        calcSurrounding();
                        wheelDir = 0;
                    }
                    if (t1 > 20 && mode2 == 1 && (keys[38] == true || keys[40] == true || keys[87] == true || keys[83] == true)) {
                        for (var x = 0; x < boardSize3[0]; x++) {
                            for (var y = 0; y < boardSize3[1]; y++) {
                                if (keys[40] == true || keys[83] == true) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                            }
                        }
                        calcSurrounding();
                        t1 = 0;
                    }

                    emptySpread();

                    // reveal all tiles if game lost
                    if (winState == -1) {
                        for (var x = 0; x < boardSize3[0]; x++) {
                            for (var y = 0; y < boardSize3[1]; y++) {
                                for (var h = 0; h < boardSize3[2]; h++) {
                                    tiles[x][y][h].state = 2;
                                }
                            }
                        }
                    }

                    break;
                }
                case 4: {
                    // render board
                    for (var x = 0; x < boardSize4[0]; x++) {
                        for (var y = 0; y < boardSize4[1]; y++) {
                            if (tiles[x][y][0][0].state == 0) {
                                // draw unrevealed tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(100, 100, 100)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);

                                // if mouse clicks on tile
                                if (t1 > 20 && mouseDown && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                    if (mouseButton == 2) {
                                        // flag tile (on right click)
                                        tiles[x][y][0][0].state = 1;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    } else if (mouseButton == 0) {
                                        // reveal tile (on left click)
/*                                      if (firstClick && tiles[x][y][0][0].bomb) {
                                            relocateBomb();
                                            tiles[x][y][0][0].bomb = 0;
                                            firstClick = false;
                                        }*/
                                        tiles[x][y][0][0].state = 2;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    }
                                }
                            } else if (tiles[x][y][0][0].state == 1) {
                                // draw flagged tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(100, 100, 100)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(255, 0, 0)";
                                ctx.font = "40px Verdana";
                                ctx.fillText("F", ((x + 1.19) * tileSize) + (tileGap / 2), ((y + 1.75) * tileSize) + (tileGap / 2));

                                // if mouse clicks on tile
                                if (t1 > 20 && mouseDown && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                    if (mouseButton == 2) {
                                        // unflag tile (on right click)
                                        tiles[x][y][0][0].state = 0;
                                        t1 = 0;
                                    } else if (mouseButton == 0) {
                                        // reveal tile (on left click)
/*                                      if (firstClick && tiles[x][y][0][0].bomb) {
                                            relocateBomb();
                                            tiles[x][y][0][0].bomb = 0;
                                            firstClick = false;
                                        }*/
                                        tiles[x][y][0][0].state = 2;
                                        if (checkWin()) {
                                            console.log("win");
                                            winState = 1;
                                        }
                                        t1 = 0;
                                    }
                                }
                            } else if (tiles[x][y][0][0].state == 2) {
                                // draw revealed tile
                                ctx.beginPath();
                                ctx.fillStyle = "rgba(255, 255, 255)";
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileGap / 2), tileSize - tileGap, tileSize - tileGap);
                                if (tiles[x][y][0][0].surrounding != 0 && tiles[x][y][0][0].surrounding != -1) {
                                    ctx.beginPath();
                                    ctx.fillStyle = "rgba(255, 0, 0)";
                                    ctx.font = "40px Verdana";
                                    ctx.fillText(tiles[x][y][0][0].surrounding.toString(), ((x + 1.19) * tileSize) + (tileGap / 2), ((y + 1.75) * tileSize) + (tileGap / 2));
                                }
                                if (tiles[x][y][0][0].surrounding == -1) {
                                    ctx.beginPath();
                                    ctx.fillStyle = "rgba(255, 0, 0)";
                                    ctx.font = "40px Verdana";
                                    ctx.fillText("B", ((x + 1.19) * tileSize) + (tileGap / 2), ((y + 1.75) * tileSize) + (tileGap / 2));
                                    winState = -1;
                                }
                            }

                            if (markerMode == 1) {
                                ctx.beginPath();
                                switch (tiles[x][y][1][0].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileSize / 2) - (tileGap / 1), ((y + 1) * tileSize) + (tileGap / 2), 10, 3);
                                ctx.beginPath();
                                switch (tiles[x][y][boardSize4[2] - 1][0].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileSize / 2) - (tileGap / 1), ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap - 3, 10, 3);
                                ctx.beginPath();
                                switch (tiles[x][y][0][1].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2), ((y + 1) * tileSize) + (tileSize / 2) - (tileGap / 1), 3, 10);
                                ctx.beginPath();
                                switch (tiles[x][y][0][boardSize4[3] - 1].state) {
                                    case 0: {
                                        ctx.fillStyle = "rgba(100, 100, 100)";
                                        break;
                                    }
                                    case 1: {
                                        ctx.fillStyle = "rgba(255, 0, 0)";
                                        break;
                                    }
                                    case 2: {
                                        ctx.fillStyle = "rgba(255, 255, 255)";
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                                ctx.fillRect(((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap - 3, ((y + 1) * tileSize) + (tileSize / 2) - (tileGap / 1), 3, 10);
                            }

                            // handle dim moving
                            if (t1 > 20 && mode2 == 0 && (keys[38] == true || keys[40] == true) && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                if (keys[40] == true) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                                calcSurrounding();
                                t1 = 0;
                            }
                            if (t1 > 20 && mode2 == 0 && (keys[37] == true || keys[39] == true) && mX > ((x + 1) * tileSize) + (tileGap / 2) && mY > ((y + 1) * tileSize) + (tileGap / 2) && mX < ((x + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap && mY < ((y + 1) * tileSize) + (tileGap / 2) + tileSize - tileGap) {
                                if (keys[39] == true) {
                                    tiles[x][y][z].unshift(tiles[x][y][z].pop());
                                } else {
                                    tiles[x][y][z].push(tiles[x][y][z].shift());
                                }
                                calcSurrounding();
                                t1 = 0;
                            }
                        }
                    }

                    // mode2 = 1 dim moving
                    if (t1 > 20 && mode2 == 1 && (keys[38] == true || keys[40] == true || keys[87] == true || keys[83] == true)) {
                        for (var x = 0; x < boardSize4[0]; x++) {
                            for (var y = 0; y < boardSize4[1]; y++) {
                                if (keys[40] == true || keys[83] == true) {
                                    tiles[x][y].unshift(tiles[x][y].pop());
                                } else {
                                    tiles[x][y].push(tiles[x][y].shift());
                                }
                            }
                        }
                        calcSurrounding();
                        t1 = 0;
                    }
                    if (t1 > 20 && mode2 == 1 && (keys[37] == true || keys[39] == true || keys[65] == true || keys[68] == true)) {
                        for (var x = 0; x < boardSize4[0]; x++) {
                            for (var y = 0; y < boardSize4[1]; y++) {
                                for (var z = 0; z < boardSize4[2]; z++) {
                                    if (keys[39] == true || keys[68] == true) {
                                        tiles[x][y][z].unshift(tiles[x][y][z].pop());
                                    } else {
                                        tiles[x][y][z].push(tiles[x][y][z].shift());
                                    }
                                }
                            }
                        }
                        calcSurrounding();
                        t1 = 0;
                    }

                    emptySpread();

                    // reveal all tiles if game lost
                    if (winState == -1) {
                        for (var x = 0; x < boardSize4[0]; x++) {
                            for (var y = 0; y < boardSize4[1]; y++) {
                                for (var z = 0; z < boardSize4[2]; z++) {
                                    for (var w = 0; w < boardSize4[3]; w++) {
                                        tiles[x][y][z][w].state = 2;
                                    }
                                }
                            }
                        }
                    }

                    break;
                }
                default: {
                    break;
                }
            }


            break;
        }

        // settings screen
        case 2: {
            t2++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "rgba(200, 200, 200)";
            ctx.fillRect(0, 0, 400, 400);
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 255)";
            ctx.font = "45px Verdana";
            ctx.fillText("Minesweeper", 22, 62);
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 0, 0)";
            ctx.font = "45px Verdana";
            ctx.fillText("3D", 316, 62);

            switch (dimNum) {
                case 3: {
                    // cursor
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(255, 255, 255)";
                    ctx.fillRect(20, (optDispY), 10, 10);
                    optDispY += (((100 + (optY * 30)) - optDispY) / 5);
                    if (keys[83] && t2 > 20) {
                        optY++;
                        t2 = 0;
                    }
                    if (keys[87] && t2 > 20) {
                        optY--;
                        t2 = 0;
                    }
                    if (optY < 0) {
                        optY = 6;
                    }
                    if (optY > 6) {
                        optY = 0;
                    }
                    // enter logic
                    if (keys[13]) {
                        if (optY == 6) {
                            t0 = 0;
                            optY = 0;
                            optDispY = 100;
                            screen = 0;
                        }
                    }
                    // 'a' key logic
                    if (keys[65] && t2 > 20) {
                        switch (optY) {
                            case 0: {
                                mode2--;
                                break;
                            }
                            case 1: {
                                dimNum--;
                                bombCount = 40;
                                break;
                            }
                            case 2: {
                                boardSize3[0]--;
                                findTileSize();
                                break;
                            }
                            case 3: {
                                boardSize3[1]--;
                                findTileSize();
                                break;
                            }
                            case 4: {
                                boardSize3[2]--;
                                break;
                            }
                            case 5: {
                                bombCount--;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        t2 = 0;
                    }
                    // 'd' key logic
                    if (keys[68] && t2 > 20) {
                        switch (optY) {
                            case 0: {
                                mode2++;
                                break;
                            }
                            case 1: {
                                dimNum++;
                                bombCount = 140;
                                break;
                            }
                            case 2: {
                                boardSize3[0]++;
                                findTileSize();
                                break;
                            }
                            case 3: {
                                boardSize3[1]++;
                                findTileSize();
                                break;
                            }
                            case 4: {
                                boardSize3[2]++;
                                break;
                            }
                            case 5: {
                                bombCount++;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        t2 = 0;
                    }

                    if (mode2 > 1) {
                        mode2 = 1; // restrict to 1, cause frick 0 (also 0 mode is still in developement)
                    }
                    if (mode2 < 1) {
                        mode2 = 1;
                    }

                    if (dimNum > 4) {
                        dimNum = 3;
                        bombCount = 40;
                    }
                    if (dimNum < 3) {
                        dimNum = 4;
                        bombCount = 140;
                    }

                    if (boardSize3[0] < 1) {
                        boardSize3[0] = 1;
                    }
                    if (boardSize3[1] < 1) {
                        boardSize3[1] = 1;
                    }
                    if (boardSize3[2] < 1) {
                        boardSize3[2] = 1;
                    }

                    if (bombCount < 0) {
                        bombCount = boardSize3[0] * boardSize3[1] * boardSize3[2];
                    }
                    if (bombCount > boardSize3[0] * boardSize3[1] * boardSize3[2]) {
                        bombCount = 0;
                    }

                    // mode option
                    ctx.beginPath();
                    if (optDispY > 95 && optDispY < 105) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    switch (mode2) {
                        case 0: {
                            ctx.fillText("Mode: Individual", 40, 114);
                            break;
                        }
                        case 1: {
                            ctx.fillText("Mode: Board", 40, 114);
                            break;
                        }
                        default: {
                            ctx.fillText("Mode: ERROR", 40, 114);
                            break;
                        }
                    }

                    // dim num option
                    ctx.beginPath();
                    if (optDispY > 125 && optDispY < 135) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Dimension Amount: " + dimNum.toString(), 40, 144);

                    // board size x option
                    ctx.beginPath();
                    if (optDispY > 155 && optDispY < 165) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (X): " + boardSize3[0].toString(), 40, 174);

                    // board size y option
                    ctx.beginPath();
                    if (optDispY > 185 && optDispY < 195) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (Y): " + boardSize3[1].toString(), 40, 204);

                    // board size z option
                    ctx.beginPath();
                    if (optDispY > 215 && optDispY < 225) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (Z): " + boardSize3[2].toString(), 40, 234);

                    // bomb# option
                    ctx.beginPath();
                    if (optDispY > 245 && optDispY < 255) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Bomb Amount: " + bombCount.toString(), 40, 264);

                    // back option
                    ctx.beginPath();
                    if (optDispY > 275 && optDispY < 285) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Return to Main Menu", 40, 294);
                    break;
                }
                case 4: {
                    // cursor
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(255, 255, 255)";
                    ctx.fillRect(20, (optDispY), 10, 10);
                    optDispY += (((100 + (optY * 30)) - optDispY) / 5);
                    if (keys[83] && t2 > 20) {
                        optY++;
                        t2 = 0;
                    }
                    if (keys[87] && t2 > 20) {
                        optY--;
                        t2 = 0;
                    }
                    if (optY < 0) {
                        optY = 7;
                    }
                    if (optY > 7) {
                        optY = 0;
                    }
                    // enter logic
                    if (keys[13]) {
                        if (optY == 7) {
                            t0 = 0;
                            optY = 0;
                            optDispY = 100;
                            screen = 0;
                        }
                    }
                    // 'a' key logic
                    if (keys[65] && t2 > 20) {
                        switch (optY) {
                            case 0: {
                                mode2--;
                                break;
                            }
                            case 1: {
                                dimNum--;
                                bombCount = 40;
                                break;
                            }
                            case 2: {
                                boardSize4[0]--;
                                findTileSize();
                                break;
                            }
                            case 3: {
                                boardSize4[1]--;
                                findTileSize();
                                break;
                            }
                            case 4: {
                                boardSize4[2]--;
                                break;
                            }
                            case 5: {
                                boardSize4[3]--;
                                break;
                            }
                            case 6: {
                                bombCount--;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        t2 = 0;
                    }
                    // 'd' key logic
                    if (keys[68] && t2 > 20) {
                        switch (optY) {
                            case 0: {
                                mode2++;
                                break;
                            }
                            case 1: {
                                dimNum++;
                                bombCount = 140;
                                break;
                            }
                            case 2: {
                                boardSize4[0]++;
                                findTileSize();
                                break;
                            }
                            case 3: {
                                boardSize4[1]++;
                                findTileSize();
                                break;
                            }
                            case 4: {
                                boardSize4[2]++;
                                break;
                            }
                            case 5: {
                                boardSize4[3]++;
                                break;
                            }
                            case 6: {
                                bombCount++;
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                        t2 = 0;
                    }

                    if (mode2 > 1) {
                        mode2 = 1; // scroll to case 3 to see why this is what it is
                    }
                    if (mode2 < 1) {
                        mode2 = 1;
                    }

                    if (dimNum > 4) {
                        dimNum = 3;
                        bombCount = 40;
                    }
                    if (dimNum < 3) {
                        dimNum = 4;
                        bombCount = 140;
                    }

                    if (boardSize4[0] < 1) {
                        boardSize4[0] = 1;
                    }
                    if (boardSize4[1] < 1) {
                        boardSize4[1] = 1;
                    }
                    if (boardSize4[2] < 1) {
                        boardSize4[2] = 1;
                    }
                    if (boardSize4[3] < 1) {
                        boardSize4[3] = 1;
                    }

                    if (bombCount < 0) {
                        bombCount = boardSize4[0] * boardSize4[1] * boardSize4[2];
                    }
                    if (bombCount > boardSize4[0] * boardSize4[1] * boardSize4[2]) {
                        bombCount = 0;
                    }

                    // mode option
                    ctx.beginPath();
                    if (optDispY > 95 && optDispY < 105) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    switch (mode2) {
                        case 0: {
                            ctx.fillText("Mode: Individual", 40, 114);
                            break;
                        }
                        case 1: {
                            ctx.fillText("Mode: Board", 40, 114);
                            break;
                        }
                        default: {
                            ctx.fillText("Mode: ERROR", 40, 114);
                            break;
                        }
                    }

                    // dim num option
                    ctx.beginPath();
                    if (optDispY > 125 && optDispY < 135) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Dimension Amount: " + dimNum.toString(), 40, 144);

                    // board size x option
                    ctx.beginPath();
                    if (optDispY > 155 && optDispY < 165) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (X): " + boardSize4[0].toString(), 40, 174);

                    // board size y option
                    ctx.beginPath();
                    if (optDispY > 185 && optDispY < 195) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (Y): " + boardSize4[1].toString(), 40, 204);

                    // board size z option
                    ctx.beginPath();
                    if (optDispY > 215 && optDispY < 225) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (Z): " + boardSize4[2].toString(), 40, 234);

                    // board size w option
                    ctx.beginPath();
                    if (optDispY > 245 && optDispY < 255) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Board Size (W): " + boardSize4[3].toString(), 40, 264);
                    
                    // bomb# option
                    ctx.beginPath();
                    if (optDispY > 275 && optDispY < 285) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Bomb Amount: " + bombCount.toString(), 40, 294);

                    // back option
                    ctx.beginPath();
                    if (optDispY > 305 && optDispY < 315) {
                        ctx.fillStyle = "rgba(255, 255, 255)";
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0)";
                    }
                    ctx.font = "25px Verdana";
                    ctx.fillText("Return to Main Menu", 40, 324);

                    break;
                }
                default: {
                    break;
                }
            }

            break;
        }

        default: {
            // blank screen
            ctx.beginPath();
            ctx.fillStyle = "rgba(200, 200, 200)";
            ctx.fillRect(0, 0, 400, 400);

            break;
        }
    }
}
 
// function referencing three board functions
function setUpBoard() {
    zeroBoard();
    placeBombs();
    fillEmptyTiles();
    calcSurrounding();
}
 
// fills empty tiles in list after bombs have been placed
function fillEmptyTiles() {
    switch (dimNum) {
        case 3: {
            for (var x = 0; x < boardSize3[0]; x++) {
                for (var y = 0; y < boardSize3[1]; y++) {
                    for (var h = 0; h < boardSize3[2]; h++) {
                        if (!tiles[x][y][h]) {
                            tiles[x][y][h] = new Tile(0, 0);
                        }
                    }
                }
            }
            break;
        }
        case 4: {
            for (var x = 0; x < boardSize4[0]; x++) {
                for (var y = 0; y < boardSize4[1]; y++) {
                    for (var z = 0; z < boardSize4[2]; z++) {
                        for (var w = 0; w < boardSize4[3]; w++) {
                            if (!tiles[x][y][z][w]) {
                                tiles[x][y][z][w] = new Tile(0, 0);
                            }
                        }
                    }
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}
 
// places a number of bombs randomly (number determined by variable bombCount)
function placeBombs() {
    switch (dimNum) {
        case 3: {
            for (var n = 0; n < bombCount; n++) {
                randX = Math.floor(Math.random() * boardSize3[0]);
                randY = Math.floor(Math.random() * boardSize3[1]);
                randH = Math.floor(Math.random() * boardSize3[2]);
                if (tiles[randX][randY][randH]) {
                    n--;
                } else {
                    tiles[randX][randY][randH] = new Tile(1, 0);
                }
            }
            break;
        }
        case 4: {
            for (var n = 0; n < bombCount; n++) {
                randX = Math.floor(Math.random() * boardSize4[0]);
                randY = Math.floor(Math.random() * boardSize4[1]);
                randZ = Math.floor(Math.random() * boardSize4[2]);
                randW = Math.floor(Math.random() * boardSize4[2]);
                if (tiles[randX][randY][randZ][randW]) {
                    n--;
                } else {
                    tiles[randX][randY][randZ][randW] = new Tile(1, 0);
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}
 
// sets up board with dimensions as according to variable boardSize3
function zeroBoard() {
    switch (dimNum) {
        case 3: {
            tiles = [];
 
            for (var i = 0; i < boardSize3[0]; i++) {
                var subarray = [];
                for (var j = 0; j < boardSize3[1]; j++) {
                    var subsubarray = [];
                    for (var k = 0; k < boardSize3[2]; k++) {
                        subsubarray.push(0);
                    }
                    subarray.push(subsubarray);
                }
                tiles.push(subarray);
            }
            break;
        }
        case 4: {
            tiles = [];
 
            for (var i = 0; i < boardSize4[0]; i++) {
                var subarray = [];
                for (var j = 0; j < boardSize4[1]; j++) {
                    var subsubarray = [];
                    for (var k = 0; k < boardSize4[2]; k++) {
                        var subsubsubarray = [];
                        for(var l = 0; l < boardSize4[3]; l++) {
                            subsubsubarray.push(0);
                        }
                        subsubarray.push(subsubsubarray);
                    }
                    subarray.push(subsubarray);
                }
                tiles.push(subarray);
            }
            break;
        }
        default: {
            break;
        }
    }
}
 
// calculate # of bombs surrounding each tile
function calcSurrounding() {
    switch (dimNum) {
        case 3: {
            for (var x = 0; x < boardSize3[0]; x++) {
                for (var y = 0; y < boardSize3[1]; y++) {
                    for (var h = 0; h < boardSize3[2]; h++) {
                        if (!tiles[x][y][h].bomb) {
                            tiles[x][y][h].surrounding = 0;
                            if (x != 0) {
                                if (tiles[x - 1][y][h].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                            if (x != boardSize3[0] - 1) {
                                if (tiles[x + 1][y][h].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                            if (y != 0) {
                                if (tiles[x][y - 1][h].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                            if (y != boardSize3[1] - 1) {
                                if (tiles[x][y + 1][h].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                            if (h != 0) {
                                if (tiles[x][y][h - 1].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            } else {
                                // extra bit to make 3rd dimension coiled
                                if (tiles[x][y][boardSize3[2] - 1].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                            if (h != boardSize3[2] - 1) {
                                if (tiles[x][y][h + 1].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            } else {
                                // extra bit to make 3rd dimension coiled
                                if (tiles[x][y][0].bomb) {
                                    tiles[x][y][h].surrounding++;
                                }
                            }
                        } else {
                            tiles[x][y][h].surrounding = -1;
                        }
                    }
                }
            }
            break;
        }
        case 4: {
            for (var x = 0; x < boardSize4[0]; x++) {
                for (var y = 0; y < boardSize4[1]; y++) {
                    for (var z = 0; z < boardSize4[2]; z++) {
                        for (var w = 0; w < boardSize4[3]; w++) {
                            if (!tiles[x][y][z][w].bomb) {
                                tiles[x][y][z][w].surrounding = 0;
                                if (x != 0) {
                                    if (tiles[x - 1][y][z][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (x != boardSize4[0] - 1) {
                                    if (tiles[x + 1][y][z][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (y != 0) {
                                    if (tiles[x][y - 1][z][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (y != boardSize4[1] - 1) {
                                    if (tiles[x][y + 1][z][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (z != 0) {
                                    if (tiles[x][y][z - 1][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                } else {
                                    // extra bit to make 3rd dimension coiled
                                    if (tiles[x][y][boardSize4[2] - 1][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (z != boardSize4[2] - 1) {
                                    if (tiles[x][y][z + 1][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                } else {
                                    // extra bit to make 3rd dimension coiled
                                    if (tiles[x][y][0][w].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (w != 0) {
                                    if (tiles[x][y][z][w - 1].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                } else {
                                    // extra bit to make 4th dimension coiled
                                    if (tiles[x][y][z][boardSize4[3] - 1].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                                if (w != boardSize4[3] - 1) {
                                    if (tiles[x][y][z][w + 1].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                } else {
                                    // extra bit to make 4th dimension coiled
                                    if (tiles[x][y][z][0].bomb) {
                                        tiles[x][y][z][w].surrounding++;
                                    }
                                }
                            } else {
                                tiles[x][y][z][w].surrounding = -1;
                            }
                        }
                    }
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}
 
// iterate through tiles to check for win
function checkWin() {
    switch (dimNum) {
        case 3: {
            var win = true;

            for (var x = 0; x < boardSize3[0]; x++) {
                for (var y = 0; y < boardSize3[1]; y++) {
                    for (var h = 0; h < boardSize3[2]; h++) {
                        if (!(tiles[x][y][h].bomb == 0 && tiles[x][y][h].state == 2) && !(tiles[x][y][h].bomb == 1 && tiles[x][y][h].state == 1)) {
                            win = false;
                        }
                    }
                }
            }
        
            return win;
            break;
        }
        case 4: {
            var win = true;

            for (var x = 0; x < boardSize4[0]; x++) {
                for (var y = 0; y < boardSize4[1]; y++) {
                    for (var z = 0; z < boardSize4[2]; z++) {
                        for (var w = 0; w < boardSize4[3]; w++) {
                            if (!(tiles[x][y][z][w].bomb == 0 && tiles[x][y][z][w].state == 2) && !(tiles[x][y][z][w].bomb == 1 && tiles[x][y][z][w].state == 1)) {
                                win = false;
                            }
                        }
                    }
                }
            }
        
            return win;
            break;
        }
        default: {
            break;
        }
    }
}
 
// find appropriate tile size based off of board dimensions
function findTileSize() {
    switch (dimNum) {
        case 3: {
            if (boardSize3[0] > boardSize3[1]) {
                tileSize = 400 / (boardSize3[0] + 2);
            } else {
                tileSize = 400 / (boardSize3[1] + 2);
            }
            break;
        }
        case 4: {
            if (boardSize4[0] > boardSize4[1]) {
                tileSize = 400 / (boardSize4[0] + 2);
            } else {
                tileSize = 400 / (boardSize4[1] + 2);
            }
            break;
        }
        default: {
            break;
        }
    }
}
 
// have empty tiles reveal tiles around them when revealed
function emptySpread() {
    switch (dimNum) {
        case 3: {
            for (var x = 0; x < boardSize3[0]; x++) {
                for (var y = 0; y < boardSize3[1]; y++) {
                    for (var h = 0; h < boardSize3[2]; h++) {
                        if (tiles[x][y][h].bomb == 0 && tiles[x][y][h].surrounding == 0 && tiles[x][y][h].state == 2) {
                            if (x != 0) {
                                tiles[x - 1][y][h].state = 2;
                            }
                            if (x != boardSize3[0] - 1) {
                                tiles[x + 1][y][h].state = 2;
                            }
                            if (y != 0) {
                                tiles[x][y - 1][h].state = 2;
                            }
                            if (y != boardSize3[1] - 1) {
                                tiles[x][y + 1][h].state = 2;
                            }
                            if (h == 0) {
                                tiles[x][y][boardSize3[2] - 1].state = 2;
                            } else {
                                tiles[x][y][h - 1].state = 2;
                            }
                            if (h == boardSize3[2] - 1) {
                                tiles[x][y][0].state = 2;
                            } else {
                                tiles[x][y][h + 1].state = 2;
                            }
                        }
                    }
                }
            }
            break;
        }
        case 4: {
            for (var x = 0; x < boardSize4[0]; x++) {
                for (var y = 0; y < boardSize4[1]; y++) {
                    for (var z = 0; z < boardSize4[2]; z++) {
                        for (var w = 0; w < boardSize4[3]; w++) {
                            if (tiles[x][y][z][w].bomb == 0 && tiles[x][y][z][w].surrounding == 0 && tiles[x][y][z][w].state == 2) {
                                if (x != 0) {
                                    tiles[x - 1][y][z][w].state = 2;
                                }
                                if (x != boardSize4[0] - 1) {
                                    tiles[x + 1][y][z][w].state = 2;
                                }
                                if (y != 0) {
                                    tiles[x][y - 1][z][w].state = 2;
                                }
                                if (y != boardSize4[1] - 1) {
                                    tiles[x][y + 1][z][w].state = 2;
                                }
                                if (z == 0) {
                                    tiles[x][y][boardSize4[2] - 1][w].state = 2;
                                } else {
                                    tiles[x][y][z - 1][w].state = 2;
                                }
                                if (z == boardSize4[2] - 1) {
                                    tiles[x][y][0][w].state = 2;
                                } else {
                                    tiles[x][y][z + 1][w].state = 2;
                                }
                                if (w == 0) {
                                    tiles[x][y][z][boardSize4[3] - 1].state = 2;
                                } else {
                                    tiles[x][y][z][w - 1].state = 2;
                                }
                                if (w == boardSize4[3] - 1) {
                                    tiles[x][y][z][0].state = 2;
                                } else {
                                    tiles[x][y][z][w + 1].state = 2;
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}

function relocateBomb() {
    console.log("tryna relocate bomb fam 1")
    var n = 1;
    while (n > 0) {
        randX = Math.floor(Math.random() * boardSize3[0]);
        randY = Math.floor(Math.random() * boardSize3[1]);
        randH = Math.floor(Math.random() * boardSize3[2]);
        console.log("tryna relocate bomb fam 2")
        if (tiles[randX][randY][randH].bomb == 0) {
            console.log("tryna relocate bomb fam 3")
            tiles[randX][randY][randH].bomb = 1;
            n--;
        }
    }
}
 
// tile class
class Tile {
    constructor(bomb, state) {
        this.bomb = bomb; // 0 (not bomb) or 1 (bomb)
        this.state = state; // 0 (unrevealed), 1 (flagged), or 2 (exposed)
        this.surrounding; // surrounding number of bombs, not to be calculated upon initialisation
    }
}
 
// run function
function run() {
    main();
    window.requestAnimationFrame(run);
}
window.requestAnimationFrame(run);