const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let level;
let player2d;

// Wait to start game until level is selected
let gameLoopRunning = false;
let transitioning = false;
let levelCompleteText = "";

function gameLoop() {
    // Background gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); 
    gradient.addColorStop(1, '#E0F6FF'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update player and check for level complete
    if (!transitioning) {
        let reachedGoal = player2d.update(level);
        
        if (reachedGoal) {
            transitioning = true;
            levelCompleteText = "Level Complete!";
            if (level.currentLevelIndex + 1 >= 100) {
                levelCompleteText = "You Win!";
            }
            
            setTimeout(() => {
                level.nextLevel();
                let start = level.getStartPosition();
                player2d.setPosition(start.x, start.y);
                transitioning = false;
            }, 1500);
        }
    }
    
    // Draw
    level.draw(ctx);
    player2d.draw(ctx);
    
    if (transitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(levelCompleteText, canvas.width/2, canvas.height/2);
    }
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// The game is now started from the menu
window.start2DGame = function(levelIndex) {
    document.getElementById('menu-container').style.display = 'none';
    
    // Hide 3D game containers if any
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';

    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.getElementById('mobile-controls').style.display = 'flex';
    }
    
    level = new Level();
    level.loadLevel(levelIndex);
    let start = level.getStartPosition();
    player2d = new Player(start.x, start.y);
    
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

// Setup menu event listeners are now handled inline in HTML or left alone if not conflicting
// We can comment this out as buttons will directly call start2DGame or start3DGame
/*
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let levelIndex = parseInt(e.target.getAttribute('data-level'));
        start2DGame(levelIndex);
    });
});
*/
