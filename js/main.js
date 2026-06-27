const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let level;
let player;

// Wait to start game until level is selected
let gameLoopRunning = false;

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player and check for level complete
    let reachedGoal = player.update(level);
    
    if (reachedGoal) {
        level.nextLevel();
        let start = level.getStartPosition();
        player.setPosition(start.x, start.y);
    }
    
    // Draw
    level.draw(ctx);
    player.draw(ctx);
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// The game is now started from the menu
function startGame(levelIndex) {
    document.getElementById('menu-container').style.display = 'none';
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    
    level = new Level();
    level.loadLevel(levelIndex);
    let start = level.getStartPosition();
    player = new Player(start.x, start.y);
    
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

// Setup menu event listeners
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let levelIndex = parseInt(e.target.getAttribute('data-level'));
        startGame(levelIndex);
    });
});
