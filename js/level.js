class Level {
    constructor() {
        this.currentLevelIndex = 0;
        
        // Define our levels
        this.levels = [
            // Level 1
            {
                platforms: [
                    { x: 0, y: 550, w: 800, h: 50, color: '#4CAF50' },   // Ground
                    { x: 150, y: 450, w: 150, h: 20, color: '#8B4513' }, // Platform 1
                    { x: 400, y: 350, w: 200, h: 20, color: '#8B4513' }, // Platform 2
                    { x: 250, y: 300, w: 100, h: 20, color: '#8B4513' }, // Extra brick
                    { x: 100, y: 250, w: 100, h: 20, color: '#8B4513' }, // Platform 3
                    { x: 600, y: 200, w: 150, h: 20, color: '#8B4513' }, // Platform 4
                    { x: 300, y: 150, w: 100, h: 20, color: '#8B4513' }  // Platform 5
                ],
                goal: { x: 330, y: 110, w: 40, h: 40, color: '#FFD700' }, // Gold square
                startPosition: { x: 50, y: 450 }
            },
            // Level 2
            {
                platforms: [
                    { x: 0, y: 550, w: 800, h: 50, color: '#4CAF50' },   // Ground
                    { x: 200, y: 500, w: 50, h: 50, color: '#8B4513' },
                    { x: 350, y: 450, w: 50, h: 100, color: '#8B4513' },
                    { x: 500, y: 350, w: 100, h: 20, color: '#8B4513' },
                    { x: 650, y: 250, w: 50, h: 20, color: '#8B4513' },
                    { x: 450, y: 150, w: 50, h: 20, color: '#8B4513' },
                    { x: 250, y: 100, w: 100, h: 20, color: '#8B4513' },
                    { x: 50, y: 150, w: 100, h: 20, color: '#8B4513' }
                ],
                goal: { x: 80, y: 110, w: 40, h: 40, color: '#FFD700' },
                startPosition: { x: 50, y: 450 }
            },
            // Level 3 (More difficult)
            {
                platforms: [
                    { x: 0, y: 550, w: 150, h: 50, color: '#4CAF50' },   // Ground 1
                    { x: 250, y: 550, w: 150, h: 50, color: '#4CAF50' }, // Ground 2 (gap)
                    { x: 500, y: 550, w: 100, h: 50, color: '#4CAF50' }, // Ground 3
                    { x: 700, y: 450, w: 50, h: 20, color: '#8B4513' },
                    { x: 500, y: 350, w: 50, h: 20, color: '#8B4513' },
                    { x: 300, y: 250, w: 50, h: 20, color: '#8B4513' },
                    { x: 100, y: 150, w: 50, h: 20, color: '#8B4513' }
                ],
                goal: { x: 105, y: 110, w: 40, h: 40, color: '#FFD700' },
                startPosition: { x: 50, y: 450 }
            }
        ];
        
        this.loadLevel(0);
    }

    loadLevel(index) {
        if (index >= this.levels.length) {
            // Game beaten! Reset to level 1 seamlessly
            index = 0;
        }
        this.currentLevelIndex = index;
        const currentData = this.levels[this.currentLevelIndex];
        this.platforms = currentData.platforms;
        this.goal = currentData.goal;
        this.startPosition = currentData.startPosition;
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
        
        // Draw goal
        if (this.goal) {
            ctx.fillStyle = this.goal.color;
            ctx.fillRect(this.goal.x, this.goal.y, this.goal.w, this.goal.h);
        }
    }

    getPlatforms() {
        return this.platforms;
    }
    
    getGoal() {
        return this.goal;
    }
    
    getStartPosition() {
        return this.startPosition;
    }
}
