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
        
        this.startPosition = { x: 385, y: 450 };
        
        // As you progress through the 100 levels, there are more platforms
        let numPlatforms = 5 + Math.floor(this.random(seed++) * 5) + Math.floor(index / 5);
        
        let currY = 550; // Start calculating gaps from the ground
        let prevX = 350; // Start in the middle
        
        for (let i = 0; i < numPlatforms; i++) {
            // Vertical gap is exactly 90 pixels (very easy to jump)
            let gapY = 90;
            let nextY = currY - gapY;
            
            // Next platform is placed left or right by at most 120 pixels from the center of the previous
            let gapX = -120 + this.random(seed++) * 240; 
            let nextX = prevX + gapX;
            
            // Keep strictly inside the screen bounds
            if (nextX < 50) nextX = 50 + this.random(seed++) * 50;
            if (nextX > 630) nextX = 630 - this.random(seed++) * 50;
            
            // Fixed, wide platforms for easy landing
            let platW = 120;
            
            this.platforms.push({ x: nextX, y: nextY, w: platW, h: 20, color: '#8B4513' });
            
            currY = nextY;
            prevX = nextX;
            
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
