'use strict';
// global vars
var gBoard;
var gGameState;
// sokoban onload function
function initSokoban() {
    document.onkeydown = checkKey;
    startGame();
}
// -------------- GAME START FUNCTIONS -----------------
// start game
function startGame() {
    // resets gVars
    msg('Game Started');
    gGameState = {
        playerI: 2, playerJ: 2, targetsCompleted: 1, targets: 7, stepCount: 0, isGlued: false
        , hasMagent: false, useMagnet: false, isSliding: false, gTimer: setInterval(function () {
            createBonus();
        }, 10000)
    };
    // builds and renders the board
    gBoard = buildBoard();
    printBoard();
    // creates 2 obstacles
    for (var i = 0; i < 2; i++) {
        createObst();
    }

}
// builds a predefined board . types: e=empty , w=wall , f=floor,t=target
function buildBoard() {
    var board = [
        [{ type: 'e' }, { type: 'e' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'e' }],
        [{ type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'f' }, { type: 'f' }, { type: 'f' }, { type: 'w' }, { type: 'e' }],
        [{ type: 'w' }, { type: 't' }, { type: 'f', contains: 'player' }, { type: 'f', contains: 'box' }, { type: 'f' }, { type: 'f' }, { type: 'w' }, { type: 'e' }],
        [{ type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'f' }, { type: 'f', contains: 'box' }, { type: 't' }, { type: 'w' }, { type: 'e' }],
        [{ type: 'w' }, { type: 't' }, { type: 'w' }, { type: 'w' }, { type: 'f', contains: 'box' }, { type: 'f' }, { type: 'w' }, { type: 'e' }],
        [{ type: 'w' }, { type: 'f' }, { type: 'w' }, { type: 'f' }, { type: 't' }, { type: 'f' }, { type: 'w' }, { type: 'w' }],
        [{ type: 'w' }, { type: 'f', contains: 'box' }, { type: 'f' }, { type: 't', contains: 'box' }, { type: 'f', contains: 'box' }, { type: 'f', contains: 'box' }, { type: 't' }, { type: 'w' }],
        [{ type: 'w' }, { type: 'f' }, { type: 'f' }, { type: 'f' }, { type: 't' }, { type: 'f' }, { type: 'f' }, { type: 'w' }],
        [{ type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }, { type: 'w' }],
    ];
    return board;
}
// prints board(game start only)
function printBoard() {
    // if a board exists, remove it
    var oldBoard = document.querySelector('table');
    if (oldBoard) {
        oldBoard.parentNode.removeChild(oldBoard);
        document.querySelector('.step-count').innerText = gGameState.stepCount;
    }
    var elTable = document.createElement('table'); // creates table
    for (var i = 0; i < gBoard.length; i++) {
        var elRow = document.createElement('tr'); // creates row
        for (var j = 0; j < gBoard[0].length; j++) {
            var elImg = document.createElement('img'); // creates img
            switch (gBoard[i][j].type) {
                case 'w':
                    elImg.setAttribute('src', 'img/wall.gif'); // inserts wall img
                    break;
                case 't': // case target, switch incase box/player is on it
                    switch (gBoard[i][j].contains) {
                        case 'player':
                            elImg.setAttribute('src', 'img/player.gif'); // inserts player img
                            break;
                        case 'box':
                            elImg.setAttribute('src', 'img/box.gif'); // inserts box img
                            elImg.style.filter = 'brightness(1.75)'; // makes it bright more
                            break;
                        default:
                            elImg.setAttribute('src', 'img/target.gif'); // inserts target img
                            break;
                    }
                    break;
                case 'f': // case floor, switch incase box/player is on it
                    switch (gBoard[i][j].contains) {
                        case 'player':
                            elImg.setAttribute('src', 'img/player.gif');
                            break;
                        case 'box':
                            elImg.setAttribute('src', 'img/box.gif');
                            break;
                        default:
                            elImg.setAttribute('src', 'img/floor.gif');
                            break;
                    }
                    break;
            }
            var elCell = document.createElement('td'); // creates the td
            if (gBoard[i][j].type !== 'e') elCell.appendChild(elImg); // if empty,dont append img
            elRow.appendChild(elCell); // inserts td inside row
        }
        elTable.appendChild(elRow);// inserts row inside table
    }
    document.querySelector('.board-container').appendChild(elTable); // inserts table inside the div container
}
// creates an obstacle on board
function createObst() {
    var obstInserted = false;
    while (!obstInserted) {
        var i = Math.floor(Math.random() * gBoard.length);
        var j = Math.floor(Math.random() * gBoard[0].length);
        var cell = gBoard[i][j];
        // checking if it is already taken
        if (cell.type !== 'w' && cell.type !== 'e' && cell.contains === undefined) {
            // creates a random obstacle and renders it
            var elCell = getElCell(i, j);
            var random = Math.random();
            var obst;
            if (random < 0.50) { obst = 'glue'; elCell.style.border = '2px solid white'; }
            else { obst = 'water'; elCell.style.border = '2px solid blue'; }
            // updating model
            obstInserted = true;
            cell.contains = obst;
        }
    }
}
//----------------- GENERAL FUNCTIONS -----------------
function getElCell(i, j) {
    var elTable = document.querySelector('table');
    var elRow = elTable.childNodes[i];
    var elCell = elRow.childNodes[j];
    return elCell;
}
function msg(string) {
    var elMsg = document.querySelector('.msg');
    elMsg.innerText = string;
}
// --------------- MID-GAME FUNCTIONS -----------------
// when a key is down - checks which key and moves in accordance
function checkKey(e) {
    e = (e) ? e : window.event;
    if (gGameState.gTimer === undefined) {
        msg('Game is Off');
        return;
    }
    else if (e.keyCode == '38') { // up
        movePlayer(-1, 0);
    }
    else if (e.keyCode == '40') { // down
        movePlayer(1, 0);
    }
    else if (e.keyCode == '37') { // left
        movePlayer(0, -1);
    }
    else if (e.keyCode == '39') { // right
        movePlayer(0, 1);
    }
    else if (e.keyCode == '77') { // use magent
        if (gGameState.hasMagent) {
            gGameState.useMagnet = true;
            gGameState.hasMagent = false;
        } else msg('NO MAGNET AVAILABLE')
    }
}
// moves player
function movePlayer(p, k) { // p is the i-adder , k is the j-adder
    var elOldCell = getElCell(gGameState.playerI, gGameState.playerJ);
    var elNewCell = getElCell(gGameState.playerI + p, gGameState.playerJ + k);
    var oldCell = gBoard[gGameState.playerI][gGameState.playerJ];
    var newCell = gBoard[gGameState.playerI + p][gGameState.playerJ + k];
    // if wall or glued, do nothing
    if (newCell.type === 'w' || gGameState.isGlued) {
        gGameState.isSliding = false;
        return;
    }
    // if contains nothing OR box and moving it up succeeded,move player 
    else if (newCell.contains !== 'box' || (newCell.contains === 'box' && moveBox(p, k))) {
        // checks if there are any bonuses/obstacles
        if (newCell.contains !== undefined) {
            givePower(newCell.contains);
            elNewCell.style.border = '2px solid transparent';
        }
        // updating model
        oldCell.contains = undefined;
        newCell.contains = 'player';
        gGameState.playerI += p;
        gGameState.playerJ += k;
        gGameState.stepCount++;
        // rendering stepCount,old cell and new cell
        document.querySelector('.step-count').innerText = gGameState.stepCount;
        var src = (oldCell.type === 'f') ? 'img/floor.gif' : 'img/target.gif';
        elOldCell.firstChild.setAttribute('src', src);
        elNewCell.firstChild.setAttribute('src', 'img/player.gif');
    }
    // if used magnet - moves the box behind
    if (gGameState.useMagnet) {
        // if it's really a box behind - move it
        if (gBoard[gGameState.playerI - p - p][gGameState.playerJ - k - k].contains === 'box') moveBox(p, k, true);
        else msg('MAGNET WASTED!!! you pulled nothing...')
        gGameState.useMagnet = false;
    }
    if (gGameState.isSliding === true) movePlayer(p, k);
}
function moveBox(p, k, magnet) {
    if (magnet) {
        var elOldCell = getElCell(gGameState.playerI - p - p, gGameState.playerJ - k - k);
        var elNewCell = getElCell(gGameState.playerI - p, gGameState.playerJ - k);
        var oldCell = gBoard[gGameState.playerI - p - p][gGameState.playerJ - k - k];
        var newCell = gBoard[gGameState.playerI - p][gGameState.playerJ - k];
    } else {
        var elOldCell = getElCell(gGameState.playerI + p, gGameState.playerJ + k);
        var elNewCell = getElCell(gGameState.playerI + p + p, gGameState.playerJ + k + k);
        var oldCell = gBoard[gGameState.playerI + p][gGameState.playerJ + k];
        var newCell = gBoard[gGameState.playerI + p + p][gGameState.playerJ + k + k];
    }
    // if wall or contains box, do nothing 
    if (newCell.type === 'w' || newCell.contains === 'box') {
        gGameState.isSliding = false; // stop sliding
        return false;
    }
    // checks for bonuses/obstacles
    if (newCell.contains !== undefined) {
        givePower(newCell.contains);
        elNewCell.style.border = '2px solid transparent';
    }
    newCell.contains = 'box';
    oldCell.contains = undefined;
    // rendering old cell
    if (oldCell.type === 't') {
        elOldCell.style.filter = 'brightness(1)'; // removes brightness
        gGameState.targetsCompleted--; // if moved away from target, targetsCompleted--;
        elOldCell.firstChild.setAttribute('src', 'img/target.gif');
    } else {
        elOldCell.firstChild.setAttribute('src', 'img/floor.gif');
    }
    // rendering new cell
    elNewCell.firstChild.setAttribute('src', 'img/box.gif');
    // if moved to target,check win
    if (newCell.type === 't') {
        elNewCell.style.filter = 'brightness(1.75)'; // makes it bright more
        gGameState.targetsCompleted++;
        checkWin();
    }
    return true;
}
// creates a bonus on board
function createBonus() {
    var bonusInserted = false;
    while (!bonusInserted) {
        // gets a random cell
        var i = Math.floor(Math.random() * gBoard.length);
        var j = Math.floor(Math.random() * gBoard[0].length);
        var cell = gBoard[i][j];
        // if cell is full,skip iteration
        if (cell.type === 'w' || cell.type === 'e' || cell.contains !== undefined) continue;
        var elCell = getElCell(i, j);
        // creates a random bonus and renders it
        var random = Math.random();
        if (random < 0.50) { var bonus = 'clock'; elCell.style.border = '2px solid grey'; }
        else { var bonus = 'magnet'; elCell.style.border = '2px solid red'; }
        // updating model
        bonusInserted = true;
        cell.contains = bonus;
        // timeout function for the bonus
        setTimeout(function () {
            if (cell.contains === bonus) {
                cell.contains = undefined;
                elCell.style.border = '2px solid transparent';
            }
        }, 5000)
    }
}
// gives bonus powers
function givePower(bonus) {
    switch (bonus) {
        case 'magnet':
            gGameState.hasMagent = true;
            msg('Magnet!!! click m to use');
            break;
        case 'gold':
            // WHAT SHOULD THIS DO?
            break;
        case 'clock':
            gGameState.stepCount -= 10;
            if (gGameState.stepCount < 0) gGameState.stepCount = 0;
            msg('Clock!!! -10 to step count.');
            break;
        case 'water':
            gGameState.isSliding = true;
            msg('Water!!! slide, baby, slide...');
            break;
        case 'glue':
            gGameState.isGlued = true;
            msg('Glue!!! stuck for five seconds.');
            setTimeout(function () {
                gGameState.isGlued = false;
                gGameState.stepCount += 5;
            }, 5000)
            break;
    }
}
// ---------------------- END GAME FUNCTIONS --------------------
function checkWin() {
    if (gGameState.targetsCompleted === gGameState.targets) {
        clearInterval(gGameState.gTimer);
        gGameState.gTimer = undefined;
        showPopup();
    }
}
// Win Popup
function showPopup() {
    var elPopup = document.querySelector('.popup');
    var elTime = elPopup.querySelector('h4 > span');
    elTime.innerText = (gGameState.stepCount);
    elPopup.style.opacity = 1;
    elPopup.style.visibility = 'visible';
}
function hidePopup() {
    var elPopup = document.querySelector('.popup');
    elPopup.style.opacity = 0;
    elPopup.style.visibility = 'hidden';
}