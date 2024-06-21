const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.2;  // Gravity to affect the ball
const initialPlatformSpeed = 0.5;  // Slower initial platform speed
const ballMoveSpeed = 5;  // Faster ball movement speed
const bounceFactor = 0.7;
const ballRadius = 20;
const platformHeight = 10;
const platformWidth = 200;  // Slightly narrower platforms
const pinRadius = 5;
let score = 0;
let gameStarted = false;
let gameOverState = false;
let gameLoopId;
let platformSpeed = initialPlatformSpeed;

let ball = {
    x: canvas.width / 2,
    y: ballRadius + platformHeight,
    dx: 0,
    dy: 0,
    radius: ballRadius,
    color: 'red'
};

let platforms = [{ x: canvas.width / 2 - platformWidth / 2, y: ballRadius + platformHeight * 2, width: platformWidth, height: platformHeight, hasPins: false }];
let pins = [];

const platformDistance = 200;  // Greater initial distance between platforms

function addPlatform() {
    const platform = {
        x: Math.random() * (canvas.width - platformWidth),
        y: canvas.height + platformHeight,
        width: platformWidth,
        height: platformHeight,
        hasPins: Math.random() > 0.7  // 30% chance a platform has pins
    };
    platforms.push(platform);

    if (platform.hasPins) {
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {  // 1-3 pins per platform
            pins.push({
                x: platform.x + Math.random() * platform.width,
                y: platform.y - pinRadius,
                radius: pinRadius
            });
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = 'green';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawPins() {
    pins.forEach(pin => {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });
}

function updateBall() {
    ball.dy += gravity;
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.y + ball.radius > canvas.height) {
        gameOver();
    }

    platforms.forEach(platform => {
        if (
            ball.y + ball.radius > platform.y &&
            ball.y - ball.radius < platform.y + platform.height &&
            ball.x + ball.radius > platform.x &&
            ball.x - ball.radius < platform.x + platform.width
        ) {
            ball.dy = -ball.dy * bounceFactor;
            ball.y = platform.y - ball.radius;
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;

            // Increase difficulty
            platformSpeed += 0.02;
        }
    });

    pins.forEach(pin => {
        if (Math.hypot(ball.x - pin.x, ball.y - pin.y) < ball.radius + pin.radius) {
            gameOver();
        }
    });
}

function updatePlatforms() {
    platforms.forEach(platform => {
        platform.y -= platformSpeed;
    });
    platforms = platforms.filter(platform => platform.y + platform.height >= 0);

    if (platforms.length === 0 || canvas.height - platforms[platforms.length - 1].y > platformDistance) {
        addPlatform();
    }
}

function updatePins() {
    pins.forEach(pin => {
        pin.y -= platformSpeed;
    });
    pins = pins.filter(pin => pin.y + pin.radius >= 0);
}

function gameOver() {
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('startOverButton').classList.remove('hidden');
    gameOverState = true;

    // Update best score if the current score is higher
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('bestScore').innerText = `Best Score: ${bestScore}`;
    }

    ball.dx = 0;
    ball.dy = 0;
    platforms = [];
    pins = [];
    cancelAnimationFrame(gameLoopId);
}

let keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', event => {
    if (event.code === 'ArrowLeft') keys.left = true;
    if (event.code === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', event => {
    if (event.code === 'ArrowLeft') keys.left = false;
    if (event.code === 'ArrowRight') keys.right = false;
});

function handleInput() {
    if (keys.left) ball.dx = -ballMoveSpeed;
    else if (keys.right) ball.dx = ballMoveSpeed;
    else ball.dx = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleInput();
    updateBall();
    updatePlatforms();
    updatePins();
    drawBall();
    drawPlatforms();
    drawPins();

    gameLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!gameStarted || gameOverState) {
        gameStarted = true;
        gameOverState = false;
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('startOverButton').classList.add('hidden');
        score = 0;
        document.getElementById('score').innerText = 'Score: 0';
        ball = {
            x: canvas.width / 2,
            y: ballRadius + platformHeight,
            dx: 0,
            dy: 2,
            radius: ballRadius,
            color: 'red'
        };
        platforms = [{ x: canvas.width / 2 - platformWidth / 2, y: ballRadius + platformHeight * 2, width: platformWidth, height: platformHeight, hasPins: false }];
        pins = [];
        platformSpeed = initialPlatformSpeed;
        gameLoop();
    }
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('startOverButton').addEventListener('click', startGame);
