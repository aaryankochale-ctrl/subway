const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let level;
let player2d;

// Wait to start game until level is selected
let gameLoopRunning = false;

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player and check for level complete
    let reachedGoal = player2d.update(level);
    
    if (reachedGoal) {
        level.nextLevel();
        let start = level.getStartPosition();
        player2d.setPosition(start.x, start.y);
    }
    
    // Draw
    level.draw(ctx);
    player2d.draw(ctx);
    
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
