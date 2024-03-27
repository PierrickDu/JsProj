
let canvas, ctx;
let gameState = 'Question';
let GraphObjects = [];
let player;
let randomPos = {x: 0, y: 0};
let ack;

window.onload = init;

function init(event) {    
    canvas = document.querySelector('#myCanvas');    
    ctx = canvas.getContext('2d');  
    canvas.width = window.innerWidth-1;
    canvas.height = window.innerHeight-1; 
    parseQuestion();   
    startGame();    
}

function startGame() {    
    addKeyboardListener();
    addMouseListener();
    player = new Player();
    GraphObjects.push(player);
    for(let i = 0; i<10; i++){
        getRandomSpawn();
        GraphObjects.push(new Enemy(randomPos.x, randomPos.y, 50, 50));        
    }    
    GraphObjects.push(new ATH()); 
    requestAnimationFrame(animationLoop);
}

function animationLoop() {        
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (gameState) {
        case 'menuStart':
            afficheMenuStart(ctx);
            break;
        case 'gameOver':
            afficheGameOver(ctx);
            break;
        case 'ecranDebutNiveau':
            afficheEcranDebutNiveau(ctx);
            break;
        case 'jeuEnCours': 
            GraphObjects.forEach(o => {                
                o.draw(ctx);
            });          
            GraphObjects.forEach (o => {
                if(o instanceof Enemy){
                    o.move(player);
                }    
                else if (o instanceof Projectile){
                    o.move();
                }            
            }) ; 
            testeEtatClavierPourJoueur();         
            player.move();             
            if (player.hp<=0){
                gameState = 'gameOver';
            }
            player.testeCollisionAvecBordsDuCanvas(canvas.width, canvas.height);
            GraphObjects.forEach((o, index)=> {
                if(o instanceof Projectile){
                    if(o.testeCollisionAvecBordsDuCanvas(canvas.width, canvas.height)==true){
                        GraphObjects.splice(index, 1);
                    }
                }
            });
            detecteCollisionJoueurAvecObstaclesEtPieces();
            break;
    }    
    requestAnimationFrame(animationLoop);
}

function detecteCollisionJoueurAvecObstaclesEtPieces() {
    let collisionExist = false;    
    GraphObjects.forEach((o, index) => {
        if (o instanceof Enemy) {
            if (rectsOverlap(player.x, player.y, player.l, player.h, o.x, o.y, o.l, o.h)) {                                
                Player.hp-=5;
                GraphObjects.splice(index, 1);
                GraphObjects.push(new Xp ((o.x+o.l/2), (o.y+o.h/2), 10, 10))
                getRandomSpawn();
                o.x = randomPos.x;
                o.y = randomPos.y;
                GraphObjects.push(o);
                //assets.plop.play();
            } 
            GraphObjects.forEach((p, indexp) => {
                if (p instanceof Projectile){
                    if(rectsOverlap(p.x, p.y, p.l, p.h, o.x, o.y, o.l, o.h)){
                        GraphObjects.splice(index, 1);    
                        GraphObjects.splice(indexp, 1);  
                        GraphObjects.push(new Xp ((o.x+o.l/2), (o.y+o.h/2), 10, 10))
                        getRandomSpawn();
                        o.x = randomPos.x;
                        o.y = randomPos.y;
                        GraphObjects.push(o);
                    }
                }
            })
        } else if(o instanceof Xp) {
            if (rectsOverlap(player.x, player.y, player.l, player.h, o.x, o.y, o.l, o.h)) {
                GraphObjects.splice(index, 1);
                Player.xp += 5;                
                if(Player.xp>=Player.xpMax){
                    Player.xp-=Player.xpMax;
                    Player.lv++; 
                    Player.xpMax+=50                   
                }
            }
        } 
    });
}

function testeEtatClavierPourJoueur() {        
    player.vx=((inputState.left+inputState.right)*player.speed); 
    player.vy=((inputState.up+inputState.down)*player.speed); 
    if(inputState.rc==true && ack==true){        
        GraphObjects.push(new Projectile(player, mousePos));
        ack=false;
    } 
    if(inputState.rc==false){
        ack=true;
    }       
}

function getRandomSpawn(){    
    switch(getRandomInt(4)){
        case 1 :            
            randomPos.x = -50;
            randomPos.y = getRandomInt(canvas.height);           
           break;
        case 2 :            
            randomPos.x = canvas.width;
            randomPos.y = getRandomInt(canvas.height);
           break;
        case 3 :   
            randomPos.x = getRandomInt(canvas.width); 
            randomPos.y = -50;          
           break;
        case 4 : 
            randomPos.x = getRandomInt(canvas.width);   
            randomPos.y = canvas.height;        
           break;

    }  
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }


function afficheMenuStart(ctx) {
    ctx.save()
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = "130px Arial";
    ctx.fillText("Press space to start", 190, 100);
    ctx.strokeText("Press space to start", 190, 100);
    if (inputState.space) {
        gameState = 'jeuEnCours';
    }
    ctx.restore();
}

function afficheGameOver(ctx) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = "130px Arial";
    ctx.fillText("GAME OVER", 0, 200);
    ctx.strokeText("GAME OVER", 0, 200);
    if (inputState.space) {
        gameState = 'menuStart';        
    }
    ctx.restore();    
}

function parseQuestion(){
    fetch("./questions.txt")
                .then((res) => {
                    if (!res.ok) {
                        throw new Error
                            (`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => 
                      console.log(data))
                .catch((error) => 
                       console.error("Unable to fetch data:", error)); 
}

function question(){
    

}
