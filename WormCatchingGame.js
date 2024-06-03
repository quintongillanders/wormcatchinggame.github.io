var timer; // timer variable 
var wormSpawnInterval; // timer for spawning worms during gameplay
var timeLeft = 60; // default time
var timeUp = document.getElementById('timeUp'); // this will display the time up message when the time runs out 
var score = 0; // player score count
var canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 800;
var ctx = canvas.getContext('2d');
var worms = []; // array for worm 
var maxWorms = 20;
var wormsPerSpawn = 5;
var growthRate = 0.1; // increases the speed of the growth rate of the worm, shrinking and growing in size
var radius;
var minRadius = 2;
var maxRadius = 25;
var position;
var caught;
var gradient;
document.getElementById("gameCanvas").style.display = 'none';


function setTimer() {
    document.getElementById("setTimer").style.display = "block";
}

// updates the score by 1 every time the worm is caught
function updateScore() {
    $('#score').html(score);
}

// catching the worms
function catchWorm() {
    for (let i = 0; i < worms.length; i++) {
        if (worms[i].isPointInside(this.position[0], this.position[1])) {
            wormCaught();
            worms.splice(i, 1);
            caught = true;
            break;
        }
    }

}

// this sound will play if the player misses a worm
function missWorm() {
    var audio =  document.getElementById('missWorm');
    audio.pause();
    audio.currentTime = 0;
    audio.play();
    audio.volume = 0.2;

}


//when the timer runs out
function gameOver() {
    var gameOver = document.getElementById('gameOver');
    gameMusic.pause();

    gameOver.currentTime = 0;
    //play sound
    gameOver.play();

    clearInterval(timer); // stop the timer
    clearInterval(wormSpawnInterval);
    character = null; // despawn the character when the time runs out

    // show the time up message once the timer has ended. 
    timeUp.style.display = 'block';
    document.getElementById("gameCanvas").style.display = 'none';
    updateScore();
    setTimeout(function () {
        location.reload();
    }, 3000);

}


// this will display the "time up" message when the time runs out
function updateTimer() {
    timeLeft = timeLeft - 1;
    if (timeLeft >= 0)
        $('#timer').html(timeLeft);
    else {
        gameOver();
    }
}

// button to start the game and begin playing 
function startGame() {
    var audio = document.getElementById('gameMusic');


    audio.volume = 0.2; // game music volume 

    gameMusic.currentTime = 0;

    //play sound
    if (audio.paused) {
        audio.play();
        audio
        timer = setInterval(updateTimer, 1000);
        timeUp.style.hide = 'block';
        document.getElementById("startGame").style.display = 'none';
        document.getElementById("setTimer").style.display = 'none';
        document.getElementById("gameCanvas").style.display = 'block';
        worms = [];
        player();
        updateTimer();
        createWorms();
        wormSpawnInterval = setInterval(function () {
            for (let i = 1; i < wormsPerSpawn; i++) {
                if (worms.length >= maxWorms) {
                     return;   
                }
                createWorms();
            }
        }, 1000); // every second, 5 worm will spawn 

    }

}

document.getElementById('startGame').addEventListener("click", startGame);


// a success sound will play when a worm is caught and the score will increase by 1
function wormCaught() {
    var audio = document.getElementById("wormCaught");
    audio.pause();
    audio.currentTime = 0;
    audio.play();
    audio
    score++; // increase the score by 1 when the worm is caught
    audio.volume = 1;
    updateScore();
}

// spawns in the character, map, and worms
function player() {
    // Character Sprite sheet image from https://opengameart.org/content/base-character-spritesheet-16x16
    const characterSpriteSheet = new Image();
    characterSpriteSheet.src = "./assets/main_character.png";
    characterSpriteSheet.onload = load;

    // Background image Hand painted sand texture from https://opengameart.org/content/hand-painted-sand-texture-0
    const backgroundImage = new Image();
    backgroundImage.src = "./assets/Sand.png";
    backgroundImage.onload = load;

    // set this to the number of elements you want to load before initalising
    const awaitLoadCount = 3;
    let loadCount = 0;

    // time tracking
    let lastTimeStamp = 0;
    let tick = 0;

    // canvas and context, not const as we don't set the value until document ready
    let canvas;
    let ctx;

    // game objects
    let character;

    // run when the website has finished loading
    $('document').ready(function () {
        console.log("ready");
        load();
    });

    // call this function after each loadable element has finished loading.
    // Once all elements are loaded, loadCount threshold will be met to init.
    function load() {
        loadCount++;
        console.log("load " + loadCount);
        if (loadCount >= awaitLoadCount) {
            init();
        }
    }


    // initialise canvas and game elements
    function init() {
        console.log("init");
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');

        character = Character(
            characterSpriteSheet,
            [64, 64],

            [ // main character set
                [ // walk up track
                    [0, 0], [64, 0], [128, 0], [192, 0]
                ],
                [ // walk down track 
                    [256, 0], [320, 0], [384, 0], [448, 0]
                ],
                [ // walk left track
                    [0, 64], [64, 64], [128, 64], [192, 64]
                ],
                [ // walk right track 
                    [256, 64], [320, 64], [384, 64], [448, 64]
                ],
                [ // action track
                    [256, 0], [384, 128], [448, 128]
                ],

            ],

            1
        );

        character.init();
        const minWorms = 50;
        const maxWorms = 100;
        const numWorms = Math.floor(Math.random() * (maxWorms - minWorms + 1)) + minWorms;

        // Gradient for the worm fill. Colours need to be changed to your theme.
        // This will help for implementation: https://stackoverflow.com/questions/11916585/gradient-fill-relative-to-shape-position-not-canvas-position
        // Gradient will need to be added in your worm draw(), roughly line 530.
        gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, maxRadius);
        gradient.addColorStop(1, "orange");
        gradient.addColorStop(1, "#f5e6ce");
        worms = [];

        document.addEventListener("keydown", doKeyDown);
        document.addEventListener("keyup", doKeyUp);

        window.requestAnimationFrame(run);
    }

    // Game loop function
    function run(timeStamp) {
        tick = (timeStamp - lastTimeStamp);
        lastTimeStamp = timeStamp;

        update(tick);
        draw();

        window.requestAnimationFrame(run);
    }

    function update() {
        character.update(tick);
        for (let i = 0; i < worms.length; i++) {
            worms[i].update(tick);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, 800, 800);
        for (let i = 0; i < worms.length; i++) {
            worms[i].draw(ctx);
        }
        character.draw(ctx);
    }

    function doKeyDown(e) {
        e.preventDefault();
        if (character != undefined) { character.doKeyInput(e.key, true); }
    }

    function doKeyUp(e) {
        e.preventDefault();
        if (character != undefined) {
            character.doKeyInput(e.key, false);
            if (e.key === " ") {

            }
        }
    }

    // Create and return a new Character object.
    // Param: spritesheet = Image object
    // Param: spriteSize = Array of 2 numbers [width, height]
    // Param: spriteFrames = 3D array[Tracks[Frames[Frame X, Y]]]
    // Param: spriteScale = Number to scale sprite size -> canvas size
    function Character(spritesheet, spriteSize, spriteFrames, spriteScale) {
        return {

            spriteSheet: spritesheet,       // image containing the sprites
            spriteFrameSize: spriteSize,    // dimensions of the sprites in the spritesheet
            spriteFrames: spriteFrames,     // 3d array. X = animation track, Y = animation frame, Z = X & Y of frame
            spriteScale: spriteScale,       // amount to scale sprites by (numbers except 1 will be linearly interpolated)
            spriteCanvasSize: spriteSize,   // Calculated size after scale. temp value set, overwritten in init

            animationTrack: 0,              // current animation frame set to use
            animationFrame: 0,              // current frame in animation to draw
            frameTime: 125,                 // milliseconds to wait between animation frame updates
            timeSinceLastFrame: 0,          // track time since the last frame update was performed
            lastAction: "",                 // Last user input action performed

            position: [0, 0],               // position of the character (X, Y)
            direction: [0, 0],              // X and Y axis movement amount
            velocity: 0.2,                   // rate of position change for each axis

            // Initialise variables that cannot be calculated during
            // object creation.
            init() {
                console.log("init");
                // Apply scale multiplier to sprite frame dimensions
                this.spriteCanvasSize = [
                    this.spriteFrameSize[0] * this.spriteScale,
                    this.spriteFrameSize[1] * this.spriteScale
                ];
            },

            // Handle actions for the character to perform.
            // param: action = string of action name.
            action(action) {
                console.log(`action: ${action}. Animation Frame ${this.animationFrame}`);
                // ignore duplicate actions.
                if (action == this.lastAction) {
                    console.log(`repeated action: ${action}`);
                    return;
                }

                // Handle each action type as cases.
                switch (action) {
                    case "moveLeft":
                        this.animationTrack = 2;
                        this.animationFrame = 0;
                        this.direction[0] = -this.velocity;
                        break;
                    case "moveRight":
                        this.animationTrack = 3;
                        this.animationFrame = 0;
                        this.direction[0] = this.velocity;
                        break;
                    case "moveUp":
                        this.animationTrack = 0;
                        this.animationFrame = 0;
                        this.direction[1] = -this.velocity;
                        break;
                    case "moveDown":
                        this.animationTrack = 1;
                        this.animationFrame = 0;
                        this.direction[1] = this.velocity;
                        break;
                    case "noMoveHorizontal":
                        this.direction[0] = 0;
                        this.animationFrame = 0;
                        break;
                    case "noMoveVertical":
                        this.direction[1] = 0;
                        this.animationFrame = 0;
                        break;
                    case "catchWorm":
                        console.log("catch worm");
                        this.animationTrack = 4;
                        this.animationFrame = 0;
                        this.frameTime = 100;
                    case "noCatchWorm":
                        console.log("stop catching worm");
                        // action finished, possibly set animation frame to default of moveDown.
                        this.animationFrame = 0;
                        this.frameTime = 128;
                        break;
                    default:
                        this.direction = [0, 0];
                        break;
                }

                // keep track of last action to avoid reinitialising the current action.
                this.lastAction = action;
            },

            update(tick) {
                // increase time keeper by last update delta
                this.timeSinceLastFrame += tick;
                // check if time since last frame meets threshold for new frame
                if (this.timeSinceLastFrame >= this.frameTime) {
                    // reset frame time keeper
                    this.timeSinceLastFrame = 0;

                    // update frame to next frame on the track. 
                    // Modulo wraps the frames from last frame to first.
                    if (this.direction[0] !== 0 || this.direction[1] !== 0 || this.lastAction === "catchWorm") {
                        this.animationFrame = (this.animationFrame + 1) % this.spriteFrames[this.animationTrack].length;
                    }
                }

                // Calculate how much movement to perform based on how long
                // it has been since the last position update.
                this.position[0] += this.direction[0] * tick;
                this.position[1] += this.direction[1] * tick;

                // boundary checking
                if (this.position[0] < 0) {
                    this.position[0] = 0;
                }

                if (this.position[1] < 0) {
                    this.position[1] = 0;
                }

                if (this.position[0] + this.spriteCanvasSize[0] > canvas.width) {
                    this.position[0] = canvas.width - this.spriteCanvasSize[0];
                }

                if (this.position[1] + this.spriteCanvasSize[1] > canvas.height) {
                    this.position[1] = canvas.height - this.spriteCanvasSize[1];
                }

            },
            // Draw character elements using the passed context (canvas).
            // Param: context = canvas 2D context.
            draw(context) {
                // Draw image to canvas.
                // Params: (spritesheet Image, 
                //          sprite X, sprite Y, sprite width, sprite height
                //          position on canvas X, position on canvas Y, scaled width, scaled height).
                context.drawImage(
                    this.spriteSheet,
                    this.spriteFrames[this.animationTrack][this.animationFrame][0],
                    this.spriteFrames[this.animationTrack][this.animationFrame][1],
                    this.spriteFrameSize[0],
                    this.spriteFrameSize[1],
                    this.position[0],
                    this.position[1],
                    this.spriteCanvasSize[0],
                    this.spriteCanvasSize[1]
                );
            },

            // Handle input from keyboard for the character.
            // Param: e = event key string.
            // Param: isKeyDown = boolean, true = key pressed, false = key released
            doKeyInput(e, isKeydown = true) {
                switch (e) {
                    case "w": // move up
                        if (isKeydown) this.action("moveUp");
                        else this.action("noMoveVertical");
                        break;
                    case "a": // move right
                        if (isKeydown) this.action("moveLeft");
                        else this.action("noMoveHorizontal");
                        break;
                    case "s": // move down
                        if (isKeydown) this.action("moveDown");
                        else this.action("noMoveVertical");
                        break;
                    case "d": // move left
                        if (isKeydown) this.action("moveRight");
                        else this.action("noMoveHorizontal");
                        break;
                    case " ": // space bar to catch the worms
                        if (isKeydown) {
                            caught = false;
                            this.action("catchWorm");
                            for (let i = 0; i < worms.length; i++) {
                                const worm = worms[i];
                                const distance = Math.sqrt((this.position[0] - worm.x) ** 2 + (this.position[1] - worm.y) ** 2);
                                if (distance <= 30) {
                                    worms.splice(i, 1);
                                    wormCaught();
                                    caught = true;
                                    break;

                                }
                            }
                            if (!caught) {
                                missWorm();
                            }

                        } else {

                            this.action("noCatchWorm");
                            break;

                        }
                        break;
                    default:
                        if (!isKeydown) this.action("stop");
                        break;
                }

            }
        };
    }
}

class GameObject {
    constructor(context, x, y, vx, vy, width, height) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = width;
        this.height = height;

        this.isColliding = false;

        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.getRight = this.getRight.bind(this);
        this.getBottom = this.getBottom.bind(this);
        this.setVelocity = this.setVelocity.bind(this);
        this.offsetVelocity = this.offsetVelocity.bind(this);
    }
    getRight() {
        return (this.x + this.width);
    }

    getBottom() {
        return (this.y + this.height);
    }

    draw(context) { };
    update(secondsPassed) { };
}

// drawing the worms as semi circles
class SemiCircle extends GameObject {
    constructor(context, x, y, vx, vy, radius, growthRate) {
        super(context, x, y, vx, vy);

        this.radius = radius;
        this.growthRate = growthRate;
        // new variable to tell if worm size should be growing or shrinking.
        this.isGrowing = true;
        this.minRadius = 10;
        this.maxRadius = 40;
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.setVelocity = this.setVelocity.bind(this);
    }

    draw(ctx) {
        super.draw(ctx);        
        console.log("worm.draw");
        ctx.fillStyle = this.gradient; 
        ctx.strokeStyle = 'lightsand';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update(secondsPassed) {
        super.update(secondsPassed);

        // check if should be growing or not.
        if (this.isGrowing) {
            // if growing, increase radius by growthRate
            this.radius += this.growthRate;
            // when growing, check if max size has been achieved
            if (this.radius >= this.maxRadius) {
                // If max size, change lifecycle phase to shrinking mode
                this.isGrowing = false;
                //update gradient colours
                this.gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.maxRadius);
                this.gradient.addColorStop(1, "#f5e6ce");
                this.gradient.addColorStop(0, "beige");
            }
        }
        // If shrinking after growing
        else {
            // decrease size by growth rate
            this.radius -= this.growthRate;
            // check if minimum size has been achieved
            if (this.radius <= this.minRadius) {
                this.radius = this.minRadius;
                this.x - Math.random() * this.context.canvas.width;
                this.y = Math.random() * this.context.canvas.height;
                // if min size, change lifecycle phase to growing mode and respawn the worm at a random point on the canvas to start growing again
                this.isGrowing = true;
                this.gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.maxRadius);
                this.gradient.addColorStop(1, "beige");
                this.gradient.addColorStop(0, "#f5e6ce");
            }
        }

        const newX = this.x + this.vx * secondsPassed;
        const newY = this.y + this.vy * secondsPassed;

        if (newX - this.radius < 0 || newX + this.radius > this.context.canvas.width) {
            this.vx *= -1;
        }

        if (newY - this.radius < 0 || newY + this.radius > this.context.canvas.height) {
            this.vy *= -1;
        }

        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

    }

    isPointInside(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    offsetVelocity(vx, vy) {
        this.vx += vx;
        this.vy += vy;
    }
}

// creating the worms  
function createWorms() {
    console.log("spawning worm")
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;

    // worm speed
    let vx = (Math.random() - 0.5) * 0.2; 
    let vy = (Math.random() - 0.5) * 0.2;

    const initialColor= [244, 164, 96]; // Light sand colour
    const finalColor = [245, 245, 220]; // Beige colour

    let worm = new SemiCircle(ctx, x, y, vx, vy, minRadius, growthRate);


    worm.gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.maxRadius);
                worm.gradient.addColorStop(1, "#f5e6ce");
                worm.gradient.addColorStop(0, "orange");


    worms.push(worm);
}


document.addEventListener('DOMContentLoaded', function () {
    const timeLimitDropdown = document.getElementById('timeLimit');

    timeLimitDropdown.addEventListener('change', function () {
        const selectedTime = parseInt(timeLimitDropdown.value);
        timeLeft = selectedTime;
        $('#timer').html(timeLeft);

    });
});