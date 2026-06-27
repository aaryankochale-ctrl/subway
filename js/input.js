const keys = {
    right: false,
    left: false,
    up: false
};

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            keys.up = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            keys.up = false;
            break;
    }
});
