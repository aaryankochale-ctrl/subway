let gameStarted = false;
let gameOver = false;
let score = 0;
let animationId;
let currentMode = 'obby';

// Three.js variables
let scene, camera, renderer;
let player3d;
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
const keys3d = { w: false, a: false, s: false, d: false };

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
const jungleTexture = textureLoader.load('assets/jungle_floor.png');
jungleTexture.wrapS = THREE.RepeatWrapping;
jungleTexture.wrapT = THREE.RepeatWrapping;
const obstacleTexture = textureLoader.load('assets/obstacle.png');

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
const jungleMaterial = new THREE.MeshStandardMaterial({
    map: jungleTexture,
    roughness: 1.0
});
const obstacleMaterial = new THREE.MeshStandardMaterial({
    map: obstacleTexture,
    roughness: 0.8
});
const barkMaterial = new THREE.MeshStandardMaterial({
    map: barkTexture,
    roughness: 0.9
});
const leavesMaterial = new THREE.MeshStandardMaterial({
    map: leavesTexture,
    color: 0x55ff55,
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

function createPlatform(x, y, z, width, height, depth, isGlass, isBreakable, customMaterial = null) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = customMaterial ? customMaterial : (isGlass ? (isBreakable ? breakableGlassMaterial : glassMaterial) : platformMaterial);
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

function createHurdle(x, y, z, width, height, depth, customMaterial = null) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, customMaterial ? customMaterial : hurdleMaterial);
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

    if (currentMode === 'forest') {
        generateForest();
    } else {
        generateObby();
    }

    player3d = createMinecraftCharacter();
    player3d.position.set(0, 3, 0);
    scene.add(player3d);

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
    if (code === 'KeyW' || code === 'ArrowUp') keys3d.w = true;
    if (code === 'KeyS' || code === 'ArrowDown') keys3d.s = true;
    if (code === 'KeyA' || code === 'ArrowLeft') keys3d.a = true;
    if (code === 'KeyD' || code === 'ArrowRight') keys3d.d = true;

    if (code === 'Space') {
        if (!isJumping) {
            playerVelocityY = jumpStrength;
            isJumping = true;
        }
    }
}

function handleKeyUp(event) {
    const code = event.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys3d.w = false;
    if (code === 'KeyS' || code === 'ArrowDown') keys3d.s = false;
    if (code === 'KeyA' || code === 'ArrowLeft') keys3d.a = false;
    if (code === 'KeyD' || code === 'ArrowRight') keys3d.d = false;
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
        new THREE.Vector3(player3d.position.x, player3d.position.y + 0.1, player3d.position.z), 
        new THREE.Vector3(0.6, 0.4, 0.6)
    );
    
    let onGround = false;
    let groundY = -Infinity;
    
    for (let i=0; i<platforms.length; i++) {
        let p = platforms[i];
        if (p.userData.broken) continue;
        
        p.userData.box.setFromObject(p);
        
        // Slightly expand box upwards to catch player3d falling fast
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
    const distanceTraveled = Math.max(0, -player3d.position.z);
    currentSpeed = baseSpeed + (distanceTraveled * 0.0003); // Speed scales up slowly
    score = Math.floor(distanceTraveled);
    scoreDisplay.innerText = `Score: ${score}`;

    let dx = 0;
    let dz = 0;

    if (keys3d.w) dz -= currentSpeed;
    if (keys3d.s) dz += currentSpeed;
    if (keys3d.a) dx -= currentSpeed;
    if (keys3d.d) dx += currentSpeed;

    let nextPos = player3d.position.clone();
    nextPos.x += dx;
    nextPos.z += dz;

    if (checkCollisions(nextPos)) {
        player3d.position.x = nextPos.x;
        player3d.position.z = nextPos.z;
    }

    const skinObj = player3d.userData.skinObj;
    const isMoving = dx !== 0 || dz !== 0;
    
    if (!isJumping && isMoving && skinObj && skinObj.leftArm) {
        player3d.userData.time += currentSpeed * 2.5;
        const swing = Math.sin(player3d.userData.time * 15);
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
        let diff = targetRotation - player3d.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        player3d.rotation.y += diff * 0.15;
    }

    // Y Physics
    player3d.position.y += playerVelocityY;
    playerVelocityY += gravity;

    const groundCheck = checkGround();
    
    if (groundCheck.onGround) {
        player3d.position.y = groundCheck.groundY;
        isJumping = false;
        playerVelocityY = 0;
    } else {
        isJumping = true; 
    }

    // Camera follow behind player3d
    camera.position.x += (player3d.position.x - camera.position.x) * 0.1;
    camera.position.z += (player3d.position.z + 12 - camera.position.z) * 0.1; // 12 units behind
    camera.position.y += (player3d.position.y + 6 - camera.position.y) * 0.1;  // 6 units above
    camera.lookAt(player3d.position.x, player3d.position.y + 1, player3d.position.z - 5);

    if (player3d.position.y < -15) {
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
    player3d.position.set(0, 3, 0);
    player3d.rotation.set(0, Math.PI, 0);
    playerVelocityY = 0;
    isJumping = false;
    
    keys3d.w = false;
    keys3d.a = false;
    keys3d.s = false;
    keys3d.d = false;

    clock.start();
    
    if (currentMode === 'forest') {
        generateForest();
    } else {
        generateObby();
    }
    
    gameOverScreen.style.display = 'none';
    gameStarted = true;
    animate();
}

window.start3DGame = function(mode = 'obby') {
    currentMode = mode;
    document.getElementById('menu-container').style.display = 'none';
    
    // Hide 2D game canvas if it exists
    const canvas2d = document.getElementById('gameCanvas');
    if (canvas2d) canvas2d.style.display = 'none';

    gameContainer.style.display = 'block';
    gameUi.style.display = 'block';
    
    if (!scene) {
        init3D();
    }
    
    resetGame();
};

document.getElementById('restart-btn').addEventListener('click', resetGame);

function generateForest() {
    // Starting platform
    createPlatform(0, 0, 0, 10, 2, 10, false, false, jungleMaterial);

    let currentZ = -10;
    
    for (let i = 0; i < 60; i++) {
        if (Math.random() < 0.15) {
            currentZ -= (2 + Math.random() * 2);
        }
        
        createPlatform(0, 0, currentZ, 12, 2, 8, false, false, jungleMaterial);
        
        // Add hurdles
        if (Math.random() < 0.5) {
            let numHurdles = Math.floor(Math.random() * 3) + 1;
            for (let h = 0; h < numHurdles; h++) {
                let xPos = (Math.random() - 0.5) * 8;
                createHurdle(xPos, 1.5, currentZ + (Math.random()-0.5)*4, 1.5, 2, 1, obstacleMaterial);
            }
        }
        
        // Add trees on the sides
        if (Math.random() < 0.8) {
            createTree(-5.5 - Math.random() * 2, currentZ);
        }
        if (Math.random() < 0.8) {
            createTree(5.5 + Math.random() * 2, currentZ);
        }
        
        currentZ -= 8;
    }
}

function createTree(x, z) {
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.5, 4);
    const trunk = new THREE.Mesh(trunkGeo, barkMaterial);
    trunk.position.set(x, 3, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    platforms.push(trunk); 
    
    // Leaves
    const leavesGeo = new THREE.BoxGeometry(3, 3, 3);
    const leaves = new THREE.Mesh(leavesGeo, leavesMaterial);
    leaves.position.set(x, 6, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    scene.add(leaves);
    platforms.push(leaves);
}
