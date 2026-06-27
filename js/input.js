const keys2d = {
    right: false,
    left: false,
    up: false
};

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            keys2d.right = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys2d.left = true;
            break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            keys2d.up = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            keys2d.right = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys2d.left = false;
            break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            keys2d.up = false;
            break;
    }
});
