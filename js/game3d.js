let gameStarted = false;
let gameOver = false;
let score = 0;
let animationId;

// Three.js variables
let scene, camera, renderer;
let player;
let platforms = []; 
let hurdles = [];

// Physics variables
let playerVelocityY = 0;
let isJumping = false;
const gravity = -0.015;
const jumpStrength = 0.35;
let baseSpeed = 0.15; // WASD speed
let currentSpeed = baseSpeed;

// Input Tracking
const keys = { w: false, a: false, s: false, d: false };

// Animation timer
let clock = new THREE.Clock();

// DOM Elements
const gameContainer = document.getElementById('game-container');
const gameUi = document.getElementById('game-ui');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');

// Textures
const textureLoader = new THREE.TextureLoader();
const roadTexture = textureLoader.load('assets/road.png');
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
const barkTexture = textureLoader.load('assets/bark.png');
const leavesTexture = textureLoader.load('assets/leaves.png');

const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff, 
    transparent: true, 
    opacity: 0.6, 
    roughness: 0.1, 
    metalness: 0.1
});
const breakableGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff, 
    transparent: true, 
    opacity: 0.6, 
    roughness: 0.1, 
    metalness: 0.1
}); 
const hurdleMaterial = new THREE.MeshStandardMaterial({
    map: roadTexture, 
    color: 0xffaa00
});
const platformMaterial = new THREE.MeshStandardMaterial({
    map: roadTexture, 
    roughness: 0.8
});

function createMinecraftCharacter() {
    const viewer = new skinview3d.SkinViewer({
        width: 1,
        height: 1,
        skin: "https://minotar.net/skin/Steve"
    });
    const playerObject = viewer.playerObject;
    playerObject.rotation.y = Math.PI;
    playerObject.scale.set(0.1, 0.1, 0.1);
    playerObject.position.y = 1.6;

    const group = new THREE.Group();
    group.add(playerObject);
    
    playerObject.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    group.userData = { skinObj: playerObject.skin, time: 0, viewer: viewer };
    return group;
}

function generateObby() {
    // Starting platform
    createPlatform(0, 0, 0, 10, 2, 10, false, false);

    let currentZ = -10;
    
    for (let i = 0; i < 60; i++) {
        // Gap
        currentZ -= (3 + Math.random() * 3);
        
        let type = Math.random();
        
        if (type < 0.4) {
            // Normal platform
            createPlatform(0, 0, currentZ, 8, 1, 8, false, false);
            
            // Maybe a hurdle
            if (Math.random() < 0.6) {
                createHurdle((Math.random() - 0.5) * 4, 1.5, currentZ, 4, 2, 1);
            }
            currentZ -= 4;
        } else {
            // Glass bridge (2 lanes)
            let zStart = currentZ;
            for (let j = 0; j < 5; j++) {
                currentZ -= 4.2;
                let isLeftBreakable = Math.random() > 0.5;
                createPlatform(-2.5, 0, currentZ, 4, 0.5, 4, true, isLeftBreakable);
                createPlatform(2.5, 0, currentZ, 4, 0.5, 4, true, !isLeftBreakable);
            }
        }
    }
}

function createPlatform(x, y, z, width, height, depth, isGlass, isBreakable) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = isGlass ? (isBreakable ? breakableGlassMaterial : glassMaterial) : platformMaterial;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    mesh.userData = { 
        isGlass: isGlass, 
        isBreakable: isBreakable, 
        broken: false,
        box: new THREE.Box3() 
    };
    
    scene.add(mesh);
    platforms.push(mesh);
}

function createHurdle(x, y, z, width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, hurdleMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    mesh.userData = { box: new THREE.Box3() };
    
    scene.add(mesh);
    hurdles.push(mesh);
}

function init3D() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.005);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    gameContainer.innerHTML = '';
    gameContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-10, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.far = 300;
    scene.add(dirLight);

    generateObby();

    player = createMinecraftCharacter();
    player.position.set(0, 3, 0);
    scene.add(player);

    window.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('keyup', handleKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    if (gameOver) return;
    const code = event.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys.w = true;
    if (code === 'KeyS' || code === 'ArrowDown') keys.s = true;
    if (code === 'KeyA' || code === 'ArrowLeft') keys.a = true;
    if (code === 'KeyD' || code === 'ArrowRight') keys.d = true;

    if (code === 'Space') {
        if (!isJumping) {
            playerVelocityY = jumpStrength;
            isJumping = true;
        }
    }
}

function handleKeyUp(event) {
    const code = event.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys.w = false;
    if (code === 'KeyS' || code === 'ArrowDown') keys.s = false;
    if (code === 'KeyA' || code === 'ArrowLeft') keys.a = false;
    if (code === 'KeyD' || code === 'ArrowRight') keys.d = false;
}

function checkCollisions(nextPos) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(nextPos.x, nextPos.y + 1, nextPos.z), 
        new THREE.Vector3(1.2, 1.8, 1.2) // Increased slightly for better collision
    );
    
    for (let h of hurdles) {
        h.userData.box.setFromObject(h);
        if (playerBox.intersectsBox(h.userData.box)) {
            return false; 
        }
    }
    return true; 
}

function checkGround() {
    const feetBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(player.position.x, player.position.y + 0.1, player.position.z), 
        new THREE.Vector3(0.6, 0.4, 0.6)
    );
    
    let onGround = false;
    let groundY = -Infinity;
    
    for (let i=0; i<platforms.length; i++) {
        let p = platforms[i];
        if (p.userData.broken) continue;
        
        p.userData.box.setFromObject(p);
        
        // Slightly expand box upwards to catch player falling fast
        const pBox = p.userData.box.clone();
        pBox.max.y += 0.2;

        if (feetBox.intersectsBox(pBox) && playerVelocityY <= 0) {
            
            if (p.userData.isBreakable && !p.userData.broken) {
                // Break the glass!
                p.userData.broken = true;
                p.visible = false; 
                continue;
            }
            
            onGround = true;
            groundY = p.userData.box.max.y;
            break;
        }
    }
    return { onGround, groundY };
}

function updateGame() {
    if (gameOver) return;

    // Difficulty scaling: Further Z you go (negative Z), faster you get
    const distanceTraveled = Math.max(0, -player.position.z);
    currentSpeed = baseSpeed + (distanceTraveled * 0.0003); // Speed scales up slowly
    score = Math.floor(distanceTraveled);
    scoreDisplay.innerText = `Score: ${score}`;

    let dx = 0;
    let dz = 0;

    if (keys.w) dz -= currentSpeed;
    if (keys.s) dz += currentSpeed;
    if (keys.a) dx -= currentSpeed;
    if (keys.d) dx += currentSpeed;

    let nextPos = player.position.clone();
    nextPos.x += dx;
    nextPos.z += dz;

    if (checkCollisions(nextPos)) {
        player.position.x = nextPos.x;
        player.position.z = nextPos.z;
    }

    const skinObj = player.userData.skinObj;
    const isMoving = dx !== 0 || dz !== 0;
    
    if (!isJumping && isMoving && skinObj && skinObj.leftArm) {
        player.userData.time += currentSpeed * 2.5;
        const swing = Math.sin(player.userData.time * 15);
        skinObj.leftArm.rotation.x = swing;
        skinObj.rightArm.rotation.x = -swing;
        skinObj.leftLeg.rotation.x = -swing;
        skinObj.rightLeg.rotation.x = swing;
    } else if (!isMoving && !isJumping && skinObj && skinObj.leftArm) {
        skinObj.leftArm.rotation.x = 0;
        skinObj.rightArm.rotation.x = 0;
        skinObj.leftLeg.rotation.x = 0;
        skinObj.rightLeg.rotation.x = 0;
    } else if (isJumping && skinObj && skinObj.leftArm) {
        skinObj.leftArm.rotation.x = Math.PI / 4;
        skinObj.rightArm.rotation.x = Math.PI / 4;
        skinObj.leftLeg.rotation.x = -Math.PI / 6;
        skinObj.rightLeg.rotation.x = Math.PI / 6;
    }

    if (dx !== 0 || dz !== 0) {
        const targetRotation = Math.atan2(dx, dz) + Math.PI;
        let diff = targetRotation - player.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        player.rotation.y += diff * 0.15;
    }

    // Y Physics
    player.position.y += playerVelocityY;
    playerVelocityY += gravity;

    const groundCheck = checkGround();
    
    if (groundCheck.onGround) {
        player.position.y = groundCheck.groundY;
        isJumping = false;
        playerVelocityY = 0;
    } else {
        isJumping = true; 
    }

    // Camera follow behind player
    camera.position.x += (player.position.x - camera.position.x) * 0.1;
    camera.position.z += (player.position.z + 12 - camera.position.z) * 0.1; // 12 units behind
    camera.position.y += (player.position.y + 6 - camera.position.y) * 0.1;  // 6 units above
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z - 5);

    if (player.position.y < -15) {
        triggerGameOver();
    }
}

function animate() {
    if (!gameStarted) return;
    animationId = requestAnimationFrame(animate);
    updateGame();
    renderer.render(scene, camera);
}

function triggerGameOver() {
    gameOver = true;
    gameStarted = false;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.innerText = score;
    cancelAnimationFrame(animationId);
}

function resetGame() {
    platforms.forEach(p => scene.remove(p));
    platforms = [];
    hurdles.forEach(h => scene.remove(h));
    hurdles = [];
    
    gameOver = false;
    score = 0;
    currentSpeed = baseSpeed;
    player.position.set(0, 3, 0);
    player.rotation.set(0, Math.PI, 0);
    playerVelocityY = 0;
    isJumping = false;
    
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;

    clock.start();
    
    generateObby();
    
    gameOverScreen.style.display = 'none';
    gameStarted = true;
    animate();
}

window.startGame = function() {
    document.getElementById('menu-container').style.display = 'none';
    gameContainer.style.display = 'block';
    gameUi.style.display = 'block';
    
    if (!scene) {
        init3D();
    }
    
    resetGame();
};

document.getElementById('restart-btn').addEventListener('click', resetGame);
