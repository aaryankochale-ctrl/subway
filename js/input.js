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
            if (!keys2d.up) keys2d.jumpJustPressed = true;
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

function setupMobileControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    
    if (!btnLeft) return;

    function bindBtn(btn, key2dName, key3dName) {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (key2dName) {
                keys2d[key2dName] = true;
                if (key2dName === 'up') {
                    if (!keys2d.up) keys2d.jumpJustPressed = true;
                }
            }
            if (key3dName && typeof keys3d !== 'undefined') keys3d[key3dName] = true;
            
            if (key3dName === 'space' && typeof playerVelocityY !== 'undefined') {
                if (!isJumping) {
                    playerVelocityY = typeof jumpStrength !== 'undefined' ? jumpStrength : 0.35;
                    isJumping = true;
                    if (typeof playSound === 'function') playSound('jump');
                }
            }
        }, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (key2dName) keys2d[key2dName] = false;
            if (key3dName && typeof keys3d !== 'undefined') keys3d[key3dName] = false;
        }, { passive: false });
    }

    bindBtn(btnLeft, 'left', 'a');
    bindBtn(btnRight, 'right', 'd');
    bindBtn(btnJump, 'up', 'space');
}

document.addEventListener('DOMContentLoaded', setupMobileControls);
