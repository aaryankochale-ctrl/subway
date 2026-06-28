function random(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}
let index = 1;
let seed = index + 1000;
let numPlatforms = 5 + Math.floor(random(seed++) * 5) + Math.floor(index / 5);
let currX = 50, currY = 450, currW = 50, direction = 1;
for (let i = 0; i < numPlatforms; i++) {
    let gapX = 10 + random(seed++) * 50;
    let gapY = 40 + random(seed++) * 40;
    let platW = 80 + random(seed++) * 100;
    
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
    console.log('['+i+'] ' + (direction===1?'R':'L') + ' X:' + Math.round(nextX) + ' W:' + Math.round(platW) + ' Y:' + Math.round(nextY) + ' (prevX: ' + Math.round(currX) + ', prevW: ' + Math.round(currW) + ', gapX: ' + Math.round(gapX) + ')');
    currX = nextX;
    currY = nextY;
    currW = platW;
}
