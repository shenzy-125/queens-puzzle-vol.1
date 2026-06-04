const size=6;

const puzzles = [
[
 ['A','A','B','B','C','C'],
 ['A','D','D','B','C','C'],
 ['A','D','E','E','F','F'],
 ['A','D','E','F','F','F'],
 ['B','B','E','E','C','C'],
 ['B','D','D','A','A','C']
],

[
 ['A','A','B','B','C','C'],
 ['A','D','D','B','C','C'],
 ['A','D','E','E','F','C'],
 ['A','D','E','F','F','F'],
 ['B','B','E','E','C','F'],
 ['B','D','D','A','A','C']
]
];

let regions=puzzles[0];

const board=Array.from({length:size},()=>Array(size).fill(0));

const boardDiv=document.getElementById('board');
const messageDiv=document.getElementById('message');
const themeButton=document.getElementById('themeToggle');
let gameWon=false;
let seconds=0;
let puzzleSolved=false;
let currentPuzzle=1; let moves=0; let mistakes=0;
let hintsUsed=0;
let timerInterval;
let gamesPlayed=Number(localStorage.getItem('gamesPlayed')) || 0;
let gamesWon=Number(localStorage.getItem('gamesWon')) || 0;

let history=[]; let future=[];

let bestTime=localStorage.getItem('bestTime');
if(bestTime==null){
    bestTime=Infinity;
} else {
    bestTime=Number(bestTime);
}

function updateStats(){
    document.getElementById('played').textContent = `Played: ${gamesPlayed}`;
    document.getElementById('won').textContent = `Won: ${gamesWon}`;
}

function createBoard(){
    boardDiv.innerHTML='';

    for(let row=0;row<size;row++){
        for(let col=0;col<size;col++){
            const cell=document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add(`region-${regions[row][col]}`);

            cell.dataset.row=row;
            cell.dataset.col=col;

            let clickTimer=null;
            cell.addEventListener('click',()=>{
                if(clickTimer){
                    clearTimeout(clickTimer);
                    clickTimer=null;
                    toggleQueen(row,col);
                }
                clickTimer=setTimeout(()=>{
                    toggleMarker(row,col);
                },400);
            });

            boardDiv.appendChild(cell);
        }
    }
}

function toggleMarker(row,col){
    if(gameWon) return;
    if(board[row][col]===1) return;
    if(board[row][col]===2){
        board[row][col]=0;
    }
    else{
        board[row][col]=2;
    }
    renderBoard();
}   

function toggleQueen(row,col){
    if(gameWon) return;

    history.push(JSON.parse(JSON.stringify(board)));
    future=[];

    if(board[row][col]===1){
        board[row][col]=0;
    }
    else{
        board[row][col]=1;

        if(isInValidQueen(row,col)){
            mistakes++;
            document.getElementById('mistakes').textContent=`Mistakes: ${mistakes}`;
        }
    }

    moves++;
    document.getElementById('moves').textContent = `Moves: ${moves}`;

    renderBoard();
    updateQueenCounter();
    checkWin();
}

function renderBoard(){
    const cells=document.querySelectorAll('.cell');
    cells.forEach(cell=>{
        const row=parseInt(cell.dataset.row);
        const col=parseInt(cell.dataset.col);

        cell.classList.remove('queen');
        cell.classList.remove('marker');

        if(board[row][col]===1){
            cell.textContent='♛';
            cell.classList.add('queen');
        }
        else if(board[row][col]===2){
            cell.textContent='✕';
            cell.classList.add('marker');
        }
        else{
           cell.textContent='';
        }

        cell.classList.remove('invalid');

        if(board[row][col]===1 && isInValidQueen(row,col)){
            cell.classList.add('invalid');
        }
    });
}

function isInValidQueen(row,col){
    let count=0;
    for(let c=0;c<size;c++){
        if(board[row][c]===1) count++;
    }
    if(count>1) return true;

    count=0;
    for(let r=0;r<size;r++){
        if(board[r][col]===1) count++;
    }
    if(count>1) return true;

    for(let dr=-1;dr<=1;dr++){
        for(let dc=-1;dc<=1;dc++){
            if(dr===0 && dc===0) continue;

            const nr=row+dr;
            const nc=col+dc;

            if(nr>=0 && nr<size && nc>=0 && nc<size && board[nr][nc]===1){
                return true;
            }
        }
    }

    const region=regions[row][col];
    count=0;
    for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){
            if(regions[r][c]===region && board[r][c]===1){
                count++;
            }
        }
    }
    return count>1;
}

function updateQueenCounter(){
    let queens=0;
    for(let row=0;row<size;row++){
        for(let col=0;col<size;col++){
            if(board[row][col]===1){
                queens++;
            }
        }
    }
    document.getElementById('queenCounter').textContent=`Queens Placed: ${queens}/${size}`;
}

function checkWin(){
    let queens=0;
    for(let row=0;row<size;row++){
        for(let col=0;col<size;col++){
            if(board[row][col]===1){
                queens++;
                if(isInValidQueen(row,col)){
                    messageDiv.textContent="Invalid !!!";
                    return;
                }
            }
        }
    }
    if(queens===size){
        gameWon=true;
        puzzleSolved=true;
        confetti();
        messageDiv.textContent="Congratulations ! You solved it ! 🎉🎉🎉";
        clearInterval(timerInterval);

        if(seconds<bestTime){
            bestTime=seconds;
            localStorage.setItem('bestTime',bestTime);
            const mins = Math.floor(bestTime/60);
            const secs = bestTime%60;
            document.getElementById('bestTime').textContent = `Best Time: ${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        }
    } else {
        messageDiv.textContent="";
    }
}

document.getElementById('reset').addEventListener('click',()=>{
    if(puzzleSolved){
        seconds=0;
        puzzleSolved=false;
        document.getElementById('timer').textContent = "Time: 00:00";
        startTimer();
    }

    gameWon=false;
    moves=0; mistakes=0;
    history=[]; future=[];
    document.getElementById('moves').textContent = "Moves: 0";
    document.getElementById('mistakes').textContent = "Mistakes: 0";
    for(let row=0;row<size;row++){
        for(let col=0;col<size;col++){
            board[row][col]=0;
        }
    }
    messageDiv.textContent="";
    regions=puzzles[Math.floor(Math.random()*puzzles.length)];
    currentPuzzle++;
    document.getElementById('puzzleName').textContent = `Puzzle #${currentPuzzle}`;

    createBoard();
    renderBoard();
    updateQueenCounter();
});

function startTimer(){
    clearInterval(timerInterval);

    timerInterval = setInterval(()=>{
        seconds++;

        const mins = Math.floor(seconds/60);
        const secs = seconds%60;

        document.getElementById('timer').textContent =
            `Time: ${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    },1000);
}

document.getElementById('puzzleName').textContent = `Puzzle #${currentPuzzle}`;

if(bestTime!==Infinity){
    const mins = Math.floor(bestTime/60);
    const secs = bestTime%60;
    document.getElementById('bestTime').textContent = `Best Time: ${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

document.getElementById('hint').addEventListener('click',()=>{
    if(gameWon) return;
    hintsUsed++;
    document.getElementById('hints').textContent = `Hints used: ${hintsUsed}`;
    document.getElementById('message').textContent="Hint feature coming soon !";
});

document.getElementById('undo').addEventListener('click',()=>{
    if(history.length===0) return;
    if(gameWon) return;
    future.push(JSON.parse(JSON.stringify(board)));
    const previous=history.pop();

    for(let r=0;r<size;r++){
       for(let c=0;c<size;c++){
          board[r][c]=previous[r][c];
        }
    }
    renderBoard();
    updateQueenCounter();   
    checkWin();
});

document.getElementById('redo').addEventListener('click',()=>{
    if(future.length===0) return;
    if(gameWon) return;
    history.push(JSON.parse(JSON.stringify(board)));
    const next=future.pop();

    for(let r=0;r<size;r++){
       for(let c=0;c<size;c++){
          board[r][c]=next[r][c];
        }
    }
    renderBoard();
    updateQueenCounter();
    checkWin();
});

createBoard();
renderBoard();
startTimer();

themeButton.addEventListener('click',()=>{
    document.body.classList.toggle('dark');
    if(document.body.classList.contains('dark')){
        themeButton.textContent = "☀️ Light Mode";
    } else {
        themeButton.textContent = "🌙 Dark Mode";
    }
});

document.addEventListener('keydown',(e)=>{
    if(e.key==='r'){
        document.getElementById('reset').click();
    }
    if(e.key==='h'){
        document.getElementById('hint').click();
    }
    if(e.key==='d'){
        themeButton.click();
    }
});