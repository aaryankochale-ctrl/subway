class Level {
    constructor() {
        this.currentLevelIndex = 0;
        this.loadLevel(0);
    }
    
    // Seeded random number generator so levels are consistent
    random(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    loadLevel(index) {
        if (index >= 100) {
            // Game beaten! Reset to level 1 seamlessly
            index = 0;
        }
        this.currentLevelIndex = index;
        
        let seed = index + 1000; // Offset seed for variety
        
        this.platforms = [];
        this.platforms.push({ x: 0, y: 550, w: 800, h: 50, color: '#4CAF50' }); // Ground
        
        this.startPosition = { x: 50, y: 450 };
        
        // As you progress through the 100 levels, there are more platforms
        let numPlatforms = 5 + Math.floor(this.random(seed++) * 5) + Math.floor(index / 5);
        
        let currX = 50;
        let currY = 450;
        let currW = 50; // virtual start platform width
        
        let direction = 1; // 1 for right, -1 for left
        
        for (let i = 0; i < numPlatforms; i++) {
            // Gap between 40 and 140 pixels (easily jumpable, max jump is ~400px)
            let gapX = 40 + this.random(seed++) * 100;
            
            // Y diff between -80 and +60 (easily jumpable, max height is ~230px)
            let gapY = -80 + this.random(seed++) * 140;
            
            let platW = 50 + this.random(seed++) * 50;
            
            let nextX;
            if (direction === 1) {
                nextX = currX + currW + gapX;
                if (nextX + platW > 750) { // Hit right wall
                    direction = -1;
                    nextX = currX - gapX - platW; // bounce back
                }
            } else {
                nextX = currX - gapX - platW;
                if (nextX < 50) { // Hit left wall
                    direction = 1;
                    nextX = currX + currW + gapX; // bounce back
                }
            }
            
            let nextY = currY + gapY;
            if (nextY < 120) nextY = 180;
            if (nextY > 500) nextY = 450;
            
            this.platforms.push({ x: nextX, y: nextY, w: platW, h: 20, color: '#8B4513' });
            
            currX = nextX;
            currY = nextY;
            currW = platW;
            
            if (i === numPlatforms - 1) {
                this.goal = { x: nextX + platW/2 - 20, y: nextY - 40, w: 40, h: 40, color: '#FFD700' };
            }
        }
    }

    nextLevel() {
        this.loadLevel(this.currentLevelIndex + 1);
    }

    draw(ctx) {
        // Draw level indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("Level " + (this.currentLevelIndex + 1) + " / 100", 20, 40);

        // Draw platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        });
        
        // Draw goal
        if (this.goal) {
            ctx.fillStyle = this.goal.color;
            ctx.fillRect(this.goal.x, this.goal.y, this.goal.w, this.goal.h);
        }
    }

    getPlatforms() { return this.platforms; }
    getGoal() { return this.goal; }
    getStartPosition() { return this.startPosition; }
}
