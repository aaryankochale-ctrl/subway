function random(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

let index = 36; // Level 37
let seed = index + 1000;
let numPlatforms = 5 + Math.floor(random(seed++) * 5) + Math.floor(index / 5);

let currX = 50, currY = 450, currW = 50, direction = 1;

for (let i = 0; i < numPlatforms; i++) {
    let gapX = 40 + random(seed++) * 100;
    let gapY = -80 + random(seed++) * 140;
    let platW = 50 + random(seed++) * 50;
    
    let nextX;
    if (direction === 1) {
        nextX = currX + currW + gapX;
        if (nextX + platW > 750) {
            direction = -1;
            nextX = currX - gapX - platW;
        }
    } else {
        nextX = currX - gapX - platW;
        if (nextX < 50) {
            direction = 1;
            nextX = currX + currW + gapX;
        }
    }
    
    let nextY = currY + gapY;
    if (nextY < 120) nextY = 180;
    if (nextY > 500) nextY = 450;
    
    console.log('['+i+'] ' + (direction===1?'R':'L') + ' X:' + Math.round(nextX) + ' Y:' + Math.round(nextY) + ' (gapX: ' + Math.round(gapX) + ')');
    
    currX = nextX;
    currY = nextY;
    currW = platW;
}
// appending just the loop
