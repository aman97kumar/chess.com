// const {render} = require("ejs");
//This line will generate a request to backendand it will go on io.on("connection")
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard"); //DOM Element

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null; 

const renderBoard = () =>{
    //board bnao
    const board = chess.board();
    //agar phele se koi board pr element h toh  khali krdo
    boardElement.innerHTML = "";

    //creating board
    board.forEach((row,rowIndex) => {
        row.forEach((square,squareIndex) => {
            const squareElement = document.createElement("div");

            //Creating a design -> ligh and dark (green and light green)
            squareElement.classList.add("square" , 
                (rowIndex + squareIndex) %2 === 0 ? "light" : "dark"
            );

            //hr ek block ki row value h aur col value h toh usko store krlo
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;
            
            //the square which are not null hold a peice
            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece" , square.color === "w"?"white":"black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                //peice draggable h toh drag krdo
                pieceElement.addEventListener("dragstart", () =>{
                    if(pieceElement.draggable)
                    {
                        draggedPiece = pieceElement;
                        sourceSquare = {
                            row: rowIndex,
                            col: squareIndex,
                        };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend" , (e) =>{
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            //IF drag over kiya toh defualt functionality ko rok do
            squareElement.addEventListener("dragover" ,function(e){
                e.preventDefault();
            });

            //if khi pr drop kiya peice ko toh target vlaue nikal lo
            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare,targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
}

const handleMove = (source,target) =>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: "q",
    }
    socket.emit("move",move);
};

const getPieceUnicode = (peice) =>{
    const unicodePieces = {
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚",
    };
    return unicodePieces[peice.type] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole" ,function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
})

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();
