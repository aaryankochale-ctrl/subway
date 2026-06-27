class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.5;
        this.grounded = false;
        this.canDoubleJump = true;
        
        this.color = '#FF5722';
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.canDoubleJump = true;
    }

    update(level) {
        let reachedGoal = false;

        // Horizontal movement
        if (keys2d.right) {
            this.velocityX = this.speed;
        } else if (keys2d.left) {
            this.velocityX = -this.speed;
        } else {
            this.velocityX = 0;
        }

        // Apply horizontal velocity
        this.x += this.velocityX;
        
        // Horizontal collision
        this.handleCollisions(level.getPlatforms(), 'horizontal');

        // Jumping
        if (keys2d.jumpJustPressed) {
            keys2d.jumpJustPressed = false;
            if (this.grounded) {
                this.velocityY = this.jumpForce;
                this.grounded = false;
                this.canDoubleJump = true;
            } else if (this.canDoubleJump) {
                this.velocityY = this.jumpForce * 0.8;
                this.canDoubleJump = false;
            }
        }

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Reset grounded state before checking vertical collisions
        this.grounded = false;

        // Vertical collision
        this.handleCollisions(level.getPlatforms(), 'vertical');
        
        // Screen bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;
        if (this.y > 600) {
            // Respawn if falls off
            let start = level.getStartPosition();
            this.setPosition(start.x, start.y);
        }

        // Check Goal Collision
        let goal = level.getGoal();
        if (goal) {
            if (this.x < goal.x + goal.w &&
                this.x + this.width > goal.x &&
                this.y < goal.y + goal.h &&
                this.y + this.height > goal.y) {
                reachedGoal = true;
            }
        }
        
        return reachedGoal;
    }

    handleCollisions(platforms, direction) {
        for (let i = 0; i < platforms.length; i++) {
            let p = platforms[i];
            
            // Check for AABB collision
            if (this.x < p.x + p.w &&
                this.x + this.width > p.x &&
                this.y < p.y + p.h &&
                this.y + this.height > p.y) {
                
                if (direction === 'horizontal') {
                    if (this.velocityX > 0) { // Moving right
                        this.x = p.x - this.width;
                    } else if (this.velocityX < 0) { // Moving left
                        this.x = p.x + p.w;
                    }
                    this.velocityX = 0;
                } else if (direction === 'vertical') {
                    if (this.velocityY > 0) { // Falling down
                        this.y = p.y - this.height;
                        this.grounded = true;
                        this.canDoubleJump = true;
                    } else if (this.velocityY < 0) { // Jumping up (hitting ceiling)
                        this.y = p.y + p.h;
                    }
                    this.velocityY = 0;
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
