const express = require("express")
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path  = require("path")
const app = express();

//Socket runs on a server 
//so the server made by http and express is connected in below line
const server = http.createServer(app);

//all the functionality of socket.io is now stored in io variable
const io = socket(server);
PORT = 8000;

//all the functionality of Chess class is now stored in chess variable
const chess = new Chess();


let players = {};

//here current palyer is white coz first player is white in chess.com
let currentPlayer = "w";


//connecting ejs
app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res) =>{
    res.render("index");
})

//io.on means if form fronted there is call of connection then run this code written in function
io.on("connection" , function(uniquesocket){
    console.log("Connected");

    //if white nhi h toh white bnao aur fire krdo frontend pr
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole" , "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    //if someone leaves the game
    uniquesocket.on("disconnect" , function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try{
            //agar turn white ka h pr move white ne nhi chla 
            if(chess.turn() === "w" && uniquesocket.id !== players.white){
                return ;
            }
            //agar turn black ka h pr move black ne nhi chla 
            if(chess.turn() === "b" && uniquesocket.id !== players.black){
                return ;
            }
            //this below line will give the move of the player 
            const result = chess.move(move);
            //agar toh reuslt shi h mtlb voh ek valid move h toh 
            if(result){
                //player ki turn dekhlo
                currentPlayer = chess.turn();
                //voh move ko send krdo 
                io.emit("move", move);
                //aur current board ki state ko send krdo
                io.emit("boardState" , chess.fen())
            }
            else{
                //agar glt move h toh sirf samen vale player ko btao ki move glt h sbko nhi thts why uniquesocket.emit and not io.emit()
                console.log("Invalid Move : " , move);
                uniquesocket.emit("Invalid move" , move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalid Move: " ,move);
        }
    });
});


server.listen(PORT , function(){
    console.log(`Server Started at PORT: ${PORT}`);
});


