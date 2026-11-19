// Game state
const gameStates = {
    MENU: 0,
    PLAYING: 1,
    GAME_OVER: 2,
    FIX_WIFI: 3
};
let currentGameState = gameStates.MENU;

// Game variables
let duck;
let platforms = [];
let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('duckRun3HighScore') || 0;
let gameSpeed = 2;
let difficulty = 1;
let mapType = 1;
let isGameRunning = false;
let currentMusic = null;

// DOM elements
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const fixWifiScreen = document.getElementById('fix-wifi-screen');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverScoreDisplay = document.getElementById('game-over-score');
const gameOverHighScoreDisplay = document.getElementById('game-over-high-score');
const wifiFixImage = document.getElementById('wifi-fix-image');
const wifiFixText = document.getElementById('wifi-fix-text');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const mapButtons = document.querySelectorAll('.map-btn');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const fixWifiButton = document.getElementById('fix-wifi-btn');
const wifiYesBtn = document.getElementById('wifi-yes');
const wifiNoBtn = document.getElementById('wifi-no');
const backToMenuBtn = document.getElementById('back-to-menu');

// Initialize the game
function init() {
    // Set up canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Create duck
    duck = {
        x: 50,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        velocityY: 0,
        gravity: 0.8,
        jumpForce: -12,
        color: '#FFD700'
    };

    // Create initial platforms
    platforms = [
        { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: '#4CAF50' },
        { x: canvas.width, y: canvas.height - 20, width: canvas.width, height: 20, color: '#4CAF50' }
    ];

    // Create initial obstacles
    obstacles = [];

    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleUserInteraction);

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    fixWifiButton.addEventListener('click', showFixWifiPrompt);
    wifiYesBtn.addEventListener('click', fixWifiYes);
    wifiNoBtn.addEventListener('click', fixWifiNo);
    backToMenuBtn.addEventListener('click', backToMenu);

    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            difficulty = parseInt(button.dataset.difficulty);
        });
    });

    // Map buttons
    mapButtons.forEach(button => {
        button.addEventListener('click', () => {
            mapButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            mapType = parseInt(button.dataset.map);
        });
    });

    // Show menu
    showScreen('menu');
}

// Handle user interaction to enable audio
function handleUserInteraction() {
    if (!musicPlaying) {
        playMusic('menu');
        musicPlaying = true;
        document.removeEventListener('click', handleUserInteraction);
    }
}

// Show a specific screen
function showScreen(screen) {
    menuScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    fixWifiScreen.classList.remove('active');

    switch(screen) {
        case 'menu':
            menuScreen.classList.add('active');
            currentGameState = gameStates.MENU;
            break;
        case 'game':
            gameScreen.classList.add('active');
            currentGameState = gameStates.PLAYING;
            break;
        case 'gameOver':
            gameOverScreen.classList.add('active');
            currentGameState = gameStates.GAME_OVER;
            break;
        case 'fixWifi':
            fixWifiScreen.classList.add('active');
            currentGameState = gameStates.FIX_WIFI;
            break;
    }
}

// Play music
function playMusic(type) {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }

    const musicFiles = {
        'menu': 'assets/music/cg6-cyber-jump-499060.mp3',
        'game1': 'assets/music/northside-records-phonk-dash-254379.mp3',
        'game2': 'assets/music/reganati-geometry-dash-song-512161.mp3',
        'game3': 'assets/music/xomxomski-happy-video-game-music-geometry-dash-type-beat-431059.mp3'
    };

    currentMusic = new Audio(musicFiles[type]);
    currentMusic.loop = true;
    currentMusic.volume = 0.3;
    currentMusic.play().catch(e => console.log("Music play prevented:", e));
}

// Start the game
function startGame() {
    score = 0;
    gameSpeed = 2 + (difficulty * 0.5);
    isGameRunning = true;
    showScreen('game');
    playMusic(`game${difficulty}`);
    gameLoop();
}

// Restart the game
function restartGame() {
    duck.y = 300;
    duck.velocityY = 0;
    platforms = [
        { x: 0, y: 480, width: 800, height: 20, color: '#4CAF50' },
        { x: 800, y: 480, width: 800, height: 20, color: '#4CAF50' }
    ];
    obstacles = [];
    score = 0;
    isGameRunning = true;
    showScreen('game');
    playMusic(`game${difficulty}`);
}

// Game loop
function gameLoop() {
    if (!isGameRunning) return;

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update duck
    duck.velocityY += duck.gravity;
    duck.y += duck.velocityY;

    // Check for collisions with platforms
    let onGround = false;
    for (let platform of platforms) {
        if (duck.x + duck.width > platform.x &&
            duck.x < platform.x + platform.width &&
            duck.y + duck.height >= platform.y &&
            duck.y + duck.height <= platform.y + 10) {
            duck.y = platform.y - duck.height;
            duck.velocityY = 0;
            onGround = true;
        }
    }

    // Check for collisions with obstacles
    for (let obstacle of obstacles) {
        if (duck.x + duck.width > obstacle.x &&
            duck.x < obstacle.x + obstacle.width &&
            duck.y + duck.height > obstacle.y &&
            duck.y < obstacle.y + obstacle.height) {
            gameOver();
            return;
        }
    }

    // Check if duck fell off screen
    if (duck.y > canvas.height) {
        gameOver();
        return;
    }

    // Generate new platforms and obstacles
    generatePlatforms();
    generateObstacles();

    // Draw duck
    ctx.fillStyle = duck.color;
    ctx.fillRect(duck.x, duck.y, duck.width, duck.height);

    // Draw platforms
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Update score
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Generate new platforms
function generatePlatforms() {
    const canvas = document.getElementById('game-canvas');
    const lastPlatform = platforms[platforms.length - 1];

    // Generate new platform if needed
    if (lastPlatform.x < canvas.width - 200) {
        let newPlatform;
        const platformTypes = {
            '1': { width: 100 + Math.random() * 100, color: '#4CAF50' },
            '2': { width: 150 + Math.random() * 150, color: '#2E7D32' },
            '3': { width: 200 + Math.random() * 200, color: '#1B5E20' },
            '4': { width: 100 + Math.random() * 100, color: '#00BCD4' }
        };

        newPlatform = {
            x: lastPlatform.x + lastPlatform.width + Math.random() * 200 + 100,
            y: canvas.height - 20 - Math.random() * 100,
            width: platformTypes[mapType].width,
            height: 20,
            color: platformTypes[mapType].color
        };

        platforms.push(newPlatform);
    }

    // Remove platforms that are off screen
    platforms = platforms.filter(platform => platform.x + platform.width > 0);
}

// Generate new obstacles
function generateObstacles() {
    const canvas = document.getElementById('game-canvas');
    const lastObstacle = obstacles[obstacles.length - 1];
    const lastPlatform = platforms[platforms.length - 1];

    // Generate new obstacle if needed
    if (!lastObstacle || lastObstacle.x < canvas.width - 300) {
        const obstacleTypes = {
            '1': { width: 30, height: 30, color: '#F44336' }, // Spikes
            '2': { width: 40, height: 40, color: '#FF9800' }, // Fire
            '3': { width: 50, height: 50, color: '#9C27B0' }  // Laser
        };

        const newObstacle = {
            x: lastPlatform.x + lastPlatform.width + Math.random() * 300 + 100,
            y: canvas.height - lastPlatform.height - obstacleTypes[difficulty].height,
            width: obstacleTypes[difficulty].width,
            height: obstacleTypes[difficulty].height,
            color: obstacleTypes[difficulty].color
        };

        obstacles.push(newObstacle);
    }

    // Remove obstacles that are off screen
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Handle key presses
function handleKeyDown(e) {
    if (e.code === 'Space' && isGameRunning) {
        if (duck.y + duck.height >= 480 || duck.velocityY < 0) {
            duck.velocityY = duck.jumpForce;
        }
    }
}

// Game over
function gameOver() {
    isGameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('duckRun3HighScore', highScore);
    }
    gameOverScoreDisplay.textContent = `Score: ${score}`;
    gameOverHighScoreDisplay.textContent = `High Score: ${highScore}`;
    showScreen('gameOver');
    currentMusic.pause();
}

// Show Fix WiFi prompt
function showFixWifiPrompt() {
    showScreen('fixWifi');
}

// Fix WiFi - Yes
function fixWifiYes() {
    wifiFixImage.src = 'assets/jeff/jeff.png';
    wifiFixImage.style.display = 'block';
    wifiFixText.textContent = "YOUR WIFI IS FIXED!";
    wifiFixText.style.color = "green";
}

// Fix WiFi - No
function fixWifiNo() {
    wifiFixImage.style.display = 'none';
    wifiFixText.textContent = "Because you didn't let Jeff fix your WiFi, he is now broke and homeless.";
    wifiFixText.style.color = "red";
}

// Back to menu
function backToMenu() {
    showScreen('menu');
    playMusic('menu');
}

// Start the game when the page loads
window.addEventListener('load', init);
