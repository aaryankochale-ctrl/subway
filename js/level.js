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
        let currY = 550; // Start calculating gaps from the ground
        let currW = 50; // virtual start platform width
        
        let direction = 1; // 1 for right, -1 for left
        
        for (let i = 0; i < numPlatforms; i++) {
            // Horizontal gap between 20 and 80 pixels
            let gapX = 20 + this.random(seed++) * 60;
            
            // Vertical gap between 95 and 130 pixels
            // This is perfect for double jumps, and mathematically eliminates "roof bonking"
            let gapY = 95 + this.random(seed++) * 35;
            
            // Varied platform widths for creativity: 70 to 150 pixels
            let platW = 70 + this.random(seed++) * 80;
            
            let nextX;
            if (direction === 1) {
                nextX = currX + currW + gapX;
                if (nextX + platW > 750) { 
                    direction = -1;
                    nextX = currX - gapX - platW; 
                    if (nextX < 50) nextX = 50;
                }
            } else {
                nextX = currX - gapX - platW;
                if (nextX < 50) { 
                    direction = 1;
                    nextX = currX + currW + gapX; 
                    if (nextX + platW > 750) nextX = 750 - platW;
                }
            }
            
            let nextY = currY - gapY;
            
            this.platforms.push({ x: nextX, y: nextY, w: platW, h: 20, color: '#8B4513' });
            
            currX = nextX;
            currY = nextY;
            currW = platW;
            
            if (i === numPlatforms - 1) {
                this.goal = { x: nextX + platW/2 - 15, y: nextY - 50, w: 30, h: 50 };
            }
        }
    }

    nextLevel() {
        this.loadLevel(this.currentLevelIndex + 1);
    }

    draw(ctx) {
        // Draw platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
        });
        
        // Draw goal (Open Cool Door)
        if (this.goal) {
            // Door frame (dark background)
            ctx.fillStyle = '#2A1810'; 
            ctx.fillRect(this.goal.x, this.goal.y, this.goal.w, this.goal.h);
            
            // Glowing Portal inside the door frame (the exit)
            let portalGradient = ctx.createLinearGradient(this.goal.x, this.goal.y, this.goal.x, this.goal.y + this.goal.h);
            portalGradient.addColorStop(0, '#00FFFF'); // Cyan glow
            portalGradient.addColorStop(1, '#FFFFFF'); // Bright white
            ctx.fillStyle = portalGradient;
            ctx.fillRect(this.goal.x + 4, this.goal.y + 4, this.goal.w - 8, this.goal.h - 4);
            
            // The wooden door, swung open to the right with 3D perspective
            ctx.fillStyle = '#8B5A2B'; // Wood color
            ctx.beginPath();
            let hingeX = this.goal.x + this.goal.w - 4;
            let swingX = this.goal.x + this.goal.w + 16;
            ctx.moveTo(hingeX, this.goal.y + 4); // Top Hinge
            ctx.lineTo(swingX, this.goal.y + 12); // Top Swing
            ctx.lineTo(swingX, this.goal.y + this.goal.h - 8); // Bottom Swing
            ctx.lineTo(hingeX, this.goal.y + this.goal.h); // Bottom Hinge
            ctx.closePath();
            ctx.fill();
            
            // Outline the open door slightly
            ctx.strokeStyle = '#4A3018';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Doorknob on the swung open door
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.beginPath();
            ctx.arc(swingX - 4, this.goal.y + this.goal.h / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getPlatforms() { return this.platforms; }
    getGoal() { return this.goal; }
    getStartPosition() { return this.startPosition; }
}
