// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const DUCK_SIZE = 50;
const PLATFORM_SIZE = 100;
const OBSTACLE_SIZE = 50;
const COIN_SIZE = 30;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

// Game state
let gameState = {
    currentScreen: 'menu',
    difficulty: 'easy',
    currentMap: 1,
    score: 0,
    lives: 3,
    time: 0,
    gameActive: false,
    musicPlaying: false,
    duck: {
        x: 100,
        y: 200,
        width: DUCK_SIZE,
        height: DUCK_SIZE,
        velocityY: 0,
        isJumping: false
    },
    platforms: [],
    obstacles: [],
    coins: [],
    gameSpeed: 5,
    lastPlatformX: 0,
    lastObstacleX: 0,
    lastCoinX: 0,
    platformGap: 200,
    obstacleGap: 300,
    coinGap: 150,
    gameTime: 0,
    gameTimer: null
};

// Initialize game
function initGame() {
    const canvas = document.getElementById('game-canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('difficulty-btn').addEventListener('click', changeDifficulty);
    document.getElementById('maps-btn').addEventListener('click', changeMap);
    document.getElementById('wifi-btn').addEventListener('click', showWifiModal);
    document.getElementById('wifi-yes').addEventListener('click', showJeffScreen);
    document.getElementById('wifi-no').addEventListener('click', showNoJeffScreen);
    document.getElementById('jeff-ok').addEventListener('click', hideJeffScreen);
    document.getElementById('no-jeff-ok').addEventListener('click', hideNoJeffScreen);
    document.getElementById('resume-btn').addEventListener('click', resumeGame);
    document.getElementById('quit-btn').addEventListener('click', returnToMenu);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('menu-btn').addEventListener('click', returnToMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Start menu music
    document.getElementById('menu-music').play();
    gameState.musicPlaying = true;

    // Game loop
    function gameLoop() {
        if (!gameState.gameActive) return;

        update();
        render(ctx);

        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    gameState.gameTimer = setInterval(() => {
        gameState.time++;
    }, 1000);

    gameLoop();
}

// Start the game
function startGame() {
    gameState.currentScreen = 'game';
    gameState.score = 0;
    gameState.lives = 3;
    gameState.time = 0;
    gameState.duck = {
        x: 100,
        y: 200,
        width: DUCK_SIZE,
        height: DUCK_SIZE,
        velocityY: 0,
        isJumping: false
    };
    gameState.platforms = [];
    gameState.obstacles = [];
    gameState.coins = [];
    gameState.lastPlatformX = 0;
    gameState.lastObstacleX = 0;
    gameState.lastCoinX = 0;
    gameState.gameActive = true;

    // Set game speed based on difficulty
    switch(gameState.difficulty) {
        case 'easy':
            gameState.gameSpeed = 5;
            document.getElementById('game-music').src = 'assets/music/cg6-cyber-jump-499060.mp3';
            break;
        case 'medium':
            gameState.gameSpeed = 7;
            document.getElementById('game-music').src = 'assets/music/northside-records-phonk-dash-254379.mp3';
            break;
        case 'hard':
            gameState.gameSpeed = 10;
            document.getElementById('game-music').src = 'assets/music/reganati-geometry-dash-song-512161.mp3';
            break;
    }

    // Start game music
    if (!gameState.musicPlaying) {
        document.getElementById('game-music').play();
        gameState.musicPlaying = true;
    }

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show game screen
    document.getElementById('game-screen').classList.add('active');
}

// Change difficulty
function changeDifficulty() {
    const btn = document.getElementById('difficulty-btn');
    switch(gameState.difficulty) {
        case 'easy':
            gameState.difficulty = 'medium';
            btn.textContent = 'DIFFICULTY: MEDIUM';
            break;
        case 'medium':
            gameState.difficulty = 'hard';
            btn.textContent = 'DIFFICULTY: HARD';
            break;
        case 'hard':
            gameState.difficulty = 'easy';
            btn.textContent = 'DIFFICULTY: EASY';
            break;
    }
}

// Change map
function changeMap() {
    const btn = document.getElementById('maps-btn');
    gameState.currentMap = (gameState.currentMap % 4) + 1;
    btn.textContent = `MAPS: ${gameState.currentMap}`;
}

// Show WiFi modal
function showWifiModal() {
    document.getElementById('wifi-modal').classList.add('active');
}

// Show Jeff screen
function showJeffScreen() {
    document.getElementById('wifi-modal').classList.remove('active');
    document.getElementById('jeff-screen').classList.add('active');
}

// Show "no Jeff" screen
function showNoJeffScreen() {
    document.getElementById('wifi-modal').classList.remove('active');
    document.getElementById('no-jeff-screen').classList.add('active');
}

// Hide Jeff screen
function hideJeffScreen() {
    document.getElementById('jeff-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

// Hide "no Jeff" screen
function hideNoJeffScreen() {
    document.getElementById('no-jeff-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

// Resume game
function resumeGame() {
    gameState.gameActive = true;
    document.getElementById('pause-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
}

// Return to menu
function returnToMenu() {
    gameState.gameActive = false;
    clearInterval(gameState.gameTimer);
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');

    // Stop game music
    document.getElementById('game-music').pause();
    document.getElementById('game-music').currentTime = 0;
    gameState.musicPlaying = false;

    // Start menu music
    document.getElementById('menu-music').play();
    gameState.musicPlaying = true;
}

// Restart game
function restartGame() {
    gameState.gameActive = false;
    clearInterval(gameState.gameTimer);
    startGame();
}

// Handle key down
function handleKeyDown(e) {
    if (e.code === 'Space' && gameState.gameActive) {
        if (!gameState.duck.isJumping) {
            gameState.duck.velocityY = JUMP_FORCE;
            gameState.duck.isJumping = true;
        }
    } else if (e.code === 'Escape' && gameState.gameActive) {
        gameState.gameActive = false;
        document.getElementById('pause-screen').classList.add('active');
    }
}

// Handle key up
function handleKeyUp(e) {
    if (e.code === 'Space') {
        // No action needed on key up for jumping
    }
}

// Draw duck
function drawDuck(ctx) {
    ctx.fillStyle = '#FFA500'; // Orange duck
    ctx.beginPath();
    ctx.ellipse(
        gameState.duck.x + gameState.duck.width/2,
        gameState.duck.y + gameState.duck.height/2,
        gameState.duck.width/2,
        gameState.duck.height/2,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    // Draw beak
    ctx.fillStyle = '#FF6347'; // Tomato color
    ctx.beginPath();
    ctx.moveTo(gameState.duck.x + gameState.duck.width, gameState.duck.y + gameState.duck.height/2);
    ctx.lineTo(gameState.duck.x + gameState.duck.width + 15, gameState.duck.y + gameState.duck.height/2 - 10);
    ctx.lineTo(gameState.duck.x + gameState.duck.width + 15, gameState.duck.y + gameState.duck.height/2 + 10);
    ctx.closePath();
    ctx.fill();

    // Draw eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        gameState.duck.x + gameState.duck.width - 10,
        gameState.duck.y + gameState.duck.height/3,
        5, 0, Math.PI * 2
    );
    ctx.fill();
}

// Draw platform
function drawPlatform(ctx, platform) {
    ctx.fillStyle = '#8B4513'; // SaddleBrown
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

// Draw obstacle
function drawObstacle(ctx, obstacle) {
    ctx.fillStyle = '#800000'; // Maroon
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// Draw coin
function drawCoin(ctx, coin) {
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    ctx.arc(
        coin.x + coin.width/2,
        coin.y + coin.height/2,
        coin.width/2,
        0, Math.PI * 2
    );
    ctx.fill();

    // Add some shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(
        coin.x + coin.width/3,
        coin.y + coin.height/3,
        coin.width/6,
        0, Math.PI * 2
    );
    ctx.fill();
}

// Update game state
function update() {
    // Update duck position
    gameState.duck.velocityY += GRAVITY;
    gameState.duck.y += gameState.duck.velocityY;

    // Check for platform collisions
    let onPlatform = false;
    for (let i = 0; i < gameState.platforms.length; i++) {
        const platform = gameState.platforms[i];

        if (gameState.duck.x + gameState.duck.width > platform.x &&
            gameState.duck.x < platform.x + platform.width &&
            gameState.duck.y + gameState.duck.height >= platform.y &&
            gameState.duck.y + gameState.duck.height <= platform.y + 10 &&
            gameState.duck.velocityY >= 0) {

            gameState.duck.y = platform.y - gameState.duck.height;
            gameState.duck.velocityY = 0;
            gameState.duck.isJumping = false;
            onPlatform = true;
        }
    }

    // Check for obstacle collisions
    for (let i = 0; i < gameState.obstacles.length; i++) {
        const obstacle = gameState.obstacles[i];

        if (gameState.duck.x + gameState.duck.width > obstacle.x &&
            gameState.duck.x < obstacle.x + obstacle.width &&
            gameState.duck.y + gameState.duck.height > obstacle.y &&
            gameState.duck.y < obstacle.y + obstacle.height) {

            // Collision detected
            gameState.lives--;
            if (gameState.lives <= 0) {
                endGame();
                return;
            }

            // Remove obstacle
            gameState.obstacles.splice(i, 1);
            i--;
        }
    }

    // Check for coin collisions
    for (let i = 0; i < gameState.coins.length; i

            if (gameState.lives <= 0) {
                endGame();
                return;
           
