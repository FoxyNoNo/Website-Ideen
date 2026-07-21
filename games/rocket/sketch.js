//  _____    _____    ____   ___  __ ________  _________
// |     \  /  _  \  /  __\  | |/ /  | |____|  |_______|
// |  ___/  | | | |  | |     | | /   | |___       | |
// | |\ \   | |_| |  | |___  | | \   | |____      | |
// |_| \_\  \_____/  \____/  |_|\_\  |______|     |_|

//  _____       _____  ____    ____  ________
// /  ___\     / /| |  | | \  / | |  | |____|
// | | ___    / /_| |  | |\ \/ /| |  | |___
// | |_| |   / /__| |  | | \__/ | |  | |____
// \_____/  /_/   |_|  |_|      |_|  |______|

// ========================================
// TEIL 1/3
// Grundsystem + Kamera + Rakete + Sterne
// ========================================

// -----------------------------
// Erstma den ganzen Bumms erstellen
// -----------------------------

let g = 2;
let dt = 0.1;

let Rocket;
let planets = [];
let stars = [];

let cameraY = 0;
let cameraX = 0;
let RocketxForce = 0;

let boost = false;
let boostTimer = 0;
let score = 0;
let gameRunning = false;
let gameOver = false;

let button1;
let button2;

let shootingStars = [];
let explosion = [];
let highscore = 0;

let coins = 0;
let coinMilestone = 0;

let shield = false;
let shieldTimer = 0;

// -----------------------------
// Setup für was auch immer
// -----------------------------

function setup() {
  createGUI();
  generateStars();
  activateController();
  newGame();
}

// -----------------------------
// bisschen zeichnen
// -----------------------------

function draw() {
  background(5, 8, 25);
  if (gameRunning && !gameOver) {
    doTimestep();
  }

  //Sternschnuppen erzeugen
  if (random(100) < 2) {
    shootingStars.push(new ShootingStar());
  }

  //Sternschnuppen anzeigen
  for (let s of shootingStars) {
    s.show();
  }
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    shootingStars[i].show();
    if (shootingStars[i].x < -50 || shootingStars[i].y > height + 50) {
      shootingStars.splice(i, 1);
    }
  }
  for (let p of explosion) {
    p.show();
  }
  updateView();
}

// -----------------------------
// de Bild wad´de gucke gannst (und irgendwie noch bisschen anderes) [GUI]
// -----------------------------

function createGUI() {
  createCanvas(600, 600);
  button1 = createButton("New Game");
  button1.position(700, 720);
  button2 = createButton("Start Game");
  button2.position(790, 720);
}

// -----------------------------
// Buttons aktivieren nh
// -----------------------------

function activateController() {
  button1.mousePressed(newGame);
  button2.mousePressed(startGame);
}

// -----------------------------
// Neues Spiel
// -----------------------------

function newGame() {
  planets = [];
  g = 2;
  score = 0;
  coins = 0;
  coinMilestone = 0;
  cameraY = 0;
  cameraX = 0;
  gameOver = false;
  Rocket = new RocketShip(300, 100);
  Rocket.vy = 2;
  generateStars();
  createInitialPlanets();
  gameRunning = false;
}

// -----------------------------
// Spiel starten
// -----------------------------

function startGame() {
  gameRunning = true;
}

// ========================================
// Class Thing - Was das?
// ========================================

class Thing {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.m = 1;
    this.radius = 10;
  }
}

// ========================================
// Sternschnuppen niiiuuuuuuuuwww
// ========================================

class ShootingStar {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.speed = random(5, 12);
  }
  show() {
    stroke(255);
    line(this.x, this.y, this.x - 30, this.y + 30);
    this.x -= this.speed;
    this.y += this.speed;
  }
}

// ========================================
// Explosion KABUMM
// ========================================

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.life = 50;
  }
  show() {
    fill(255, 100, 0);
    circle(this.x - cameraX, height - (this.y - cameraY), 5);
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
}

// ========================================
// Flugkörper mit Rückstoßantrieb (oder einfach Rakete)
// ========================================

class RocketShip extends Thing {
  constructor(x, y) {
    super(x, y);
    this.m = 20;
    this.radius = 12;
  }
  show() {
    let sx = width - (this.x - cameraX);
    let sy = height - (this.y - cameraY);
    push();
    translate(sx, sy);

    // leichte Neigung abhängig von Bewegung
    rotate(this.vx * 0.03);

    // Flamme
    if (gameRunning && !gameOver) {
      noStroke();
      fill(255, 120, 0);
      triangle(-8, 15, 8, 15, 0, random(35, 55));
      fill(255, 220, 0);
      triangle(-5, 15, 5, 15, 0, random(25, 40));
    }

    // Raketenrumpf
    stroke(80);
    if (shield === false) {
      fill(230);
    } else {
      fill(50, 255, 255);
    }
    ellipse(0, 0, 25, 55);

    // Spitze
    if (shield === false) {
      fill(200);
    } else {
      fill(50, 255, 255);
    }
    triangle(-12, -15, 12, -15, 0, -35);

    // Spionageguckloch für Aliens
    fill(70, 180, 255);
    circle(0, -10, 10);

    // Tribwörke
    fill(150);
    triangle(-12, 15, -25, 25, -10, 5);
    triangle(12, 15, 25, 25, 10, 5);
    pop();
  }
}

// ========================================
// siehst du, wie viel STERNLEIN stehen...
// ========================================

class Star {
  constructor() {
    this.x = random(-1000, 1000);
    this.y = random(0, 10000);
    this.size = random(1, 3);

    // Tiefe für Parallax (das heißt glaub so viel wie 3D Effekt, aber in cool)
    this.depth = random(0.2, 1);
  }
  show() {
    let sx = this.x - cameraX * this.depth;
    let sy = height - (this.y - cameraY * this.depth);
    fill(255);
    noStroke();
    circle(sx, sy, this.size);
  }
}

// Sterne existentieren
function generateStars() {
  stars = [];
  for (let i = 0; i < 600; i++) {
    stars.push(new Star());
  }
}

// Sterne anzeigen
function drawStars() {
  for (let s of stars) {
    s.show();
  }
}

// ========================================
// TEIL 2/3
// Planeten-System + Generator + Gravitation
// ========================================

let highestPlanetY = 0;

// ========================================
// Planet Class
// ========================================

class Planet extends Thing {
  constructor(x, y, radius) {
    super(x, y);
    this.radius = radius;

    // Masse abhängig von Größe
    this.m = radius * radius * 2;

    // zufällige Farbe - REGENBOGEN EINHORN JUHU
    this.color = color(random(80, 230), random(80, 230), random(80, 230));

    // K(r)ater
    this.craters = [];
    for (let i = 0; i < random(3, 8); i++) {
      this.craters.push({
        x: random(-radius * 0.6, radius * 0.6),
        y: random(-radius * 0.6, radius * 0.6),
        size: random(radius * 0.1, radius * 0.3),
      });
    }
  }
  show() {
    let sx = this.x - cameraX;
    let sy = height - (this.y - cameraY);
    push(); //geschieht unabhängig zum Rest vom Code
    translate(sx, sy);

    // großer Himmelskörper (Planeteretetä)
    noStroke(); //Planet wird ausgeschnitten

    // Einfach Planet
    fill(this.color);
    circle(0, 0, this.radius * 2);

    // Lichtseite - gibts ne helle Seite der Macht???
    noStroke();
    fill(255, 255, 255, 80);
    circle(-this.radius * 0.35, -this.radius * 0.35, this.radius);

    // Schattenseite aka die dunkle Seite der Macht
    fill(0, 0, 0, 80);
    arc(0, 0, this.radius * 2, this.radius * 2, 0, PI);

    // K(r)ater hä schon wieder
    fill(40, 40, 40, 100);
    for (let c of this.craters) {
      circle(c.x, c.y, c.size);
    }
    pop(); //geschieht unabhängig zum Rest vom Code
  }
}

// ========================================
// Planeten machen
// ========================================

function generateNextPlanet() {
  let y = highestPlanetY + random(120, 250);
  let radius = random(25, 70);
  let x;
  let valid = false;

  // Versuch solange, bis et basst

  while (!valid) {
    x = cameraX + random(radius + 30, width - radius - 30);
    valid = true;
    for (let p of planets) {
      let distance = dist(x, y, p.x, p.y);
      if (distance < radius + p.radius + 100) {
        valid = false;
      }
    }

    // Sicherheitsabstand wegen Corona zur Flugbahn
    if (abs(x - Rocket.x) < 80) {
      valid = false;
    }
  }
  let newPlanet = new Planet(x, y, radius);
  planets.push(newPlanet);
  highestPlanetY = y;
}

// ========================================
// Anfangsplaneten °°°^^° °_°|°-°
// ========================================

function createInitialPlanets() {
  planets = [];
  highestPlanetY = 0;
  for (let i = 0; i < 8; i++) {
    generateNextPlanet();
  }
}

// ========================================
// Neue Planeten nachladen wie Maschinengewehr pew pew
// ========================================

function checkPlanetGeneration() {
  while (highestPlanetY < Rocket.y + 1500) {
    generateNextPlanet();
  }
}

// ========================================
// Gravitation
// ========================================

function applyGravity() {
  for (let p of planets) {
    let distance = dist(Rocket.x, Rocket.y, p.x, p.y);

    // Nur Planeten i.d. Nähe funkt.
    if (distance < 600) {
      let force = GForce(Rocket, p);
      let fx = xForceToFrom(Rocket, p, force);
      let fy = yForceToFrom(Rocket, p, force);
      Rocket.vx += (fx / Rocket.m) * dt;
      Rocket.vy += (fy / Rocket.m) * dt;
    }
  }
}

// ========================================
// Alte Gravitation aus Code raus ->>>
// ========================================

function GForce(a, b) {
  return (g * a.m * b.m) / (d(a, b) * d(a, b));
}
function d(a, b) {
  return sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
function xForceToFrom(a, b, F) {
  return ((b.x - a.x) / d(a, b)) * F;
}
function yForceToFrom(a, b, F) {
  return ((b.y - a.y) / d(a, b)) * F;
}

// ========================================
// TEIL 3/3
// Steuerung + Spielmechanik
// ========================================

// ========================================
// Steuerung
// ========================================

function keyPressed() {
  if (keyCode === LEFT_ARROW || key === "a" || key === "A") {
    RocketxForce = -40;
  }
  if (keyCode === RIGHT_ARROW || key === "d" || key === "D") {
    RocketxForce = 40;
  }

  // Boost
  if (keyCode === UP_ARROW || key === "w" || key === "W") {
    if (boostTimer <= 0) {
      boost = true;

      boostTimer = 50;
    }
  }

  //Totem of undieing
  if (key === " " && coins >= 1 && !shield) {
    coins -= 1;
    shield = true;
    shieldTimer = 300; // ca. 5 Sekunden bei 60 FPS
  }
}
function keyReleased() {
  if (
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW ||
    key === "a" ||
    key === "A" ||
    key === "d" ||
    key === "D"
  ) {
    RocketxForce = 0;
  }
}

// ========================================
// Physik - fuck my life
// ========================================

function doTimestep() {
  if (gameOver) return;

  // Gravitation
  applyGravity();

  // Seitliche Steuerung
  Rocket.vx += (RocketxForce / Rocket.m) * dt;

  // Boost
  if (boost) {
    Rocket.vy += 0.5;
    boostTimer--;
    if (boostTimer <= 0) {
      boost = false;
    }
  }

  // Bewegung
  // Rakete wird mit der Zeit immer etwas schneller
  let targetSpeed = 2 + score / 5000;
  if (Rocket.vy < targetSpeed) {
    Rocket.vy += 0.002;
  }
  Rocket.x += Rocket.vx * dt;
  Rocket.y += Rocket.vy * dt;

  // leichte Stabilisierung
  Rocket.vx *= 0.98;

  // Kamera folgt
  cameraY = Rocket.y - 250;
  cameraX = Rocket.x - 300;

  // Punkte
  score = max(score, Rocket.y);
  let reachedMilestone = floor(score / 5000); //Raketengeschwindigkeit ist 0.1
  if (reachedMilestone > coinMilestone) {
    coins += reachedMilestone - coinMilestone;
    coinMilestone = reachedMilestone;
  }
  if (shield) {
    shieldTimer--;
    if (shieldTimer <= 0) {
      shield = false;
    }
  }

  // neue Planeten Babyplaneten
  checkPlanetGeneration();

  // Kollision prüfen
  GameCheck();
}

// ========================================
// Kollision
// ========================================

function GameCheck() {
  for (let p of planets) {
    let distance = dist(Rocket.x, Rocket.y, p.x, p.y);
    if (distance < Rocket.radius + p.radius) {
      if (!shield) {
        gameOver = true;
        highscore = max(highscore, score);
        gameRunning = false;
      }
      for (let i = 0; i < 80; i++) {
        explosion.push(new Particle(Rocket.x, Rocket.y));
      }
    }
  }

  // aus Welt gefallen
  if (Rocket.y < cameraY - 200) {
    gameOver = true;
    gameRunning = false;
  }
}

// ========================================
// UpdateView erweitern
// ========================================

function updateView() {
  drawStars();
  for (let p of planets) {
    p.show();
  }
  if (Rocket) {
    Rocket.show();
  }
  fill(255);
  textSize(20);
  text("Strecke: " + floor(score / 10) + " m", 20, 30);
  if (boost) {
    text("BOOST!", 20, 140);
  }
  if (gameOver) {
    textSize(40);
    text("GAME OVER", 150, 300);
  }
  text("Highscore: " + floor(highscore / 10), 20, 90);
  text("Münzen: " + coins, 20, 60);
}

//    ___   ______         ______      ______    _______   ______    ______
//   /   | /  __  \       |____  |    /  __  \  /  ___  \ /  __  \  /  ____|
//  / /| | | |  / /           / /     | |  / /  | /   \ | | |  / /  | |____
// /_/ | |    / /            / /         / /    | |   | |    / /    |  __  |
//     | |  / /____   _     / /    _   / /____  | \___/ |  / /____  | |__| |
//     |_| |_______| |_|   /_/    |_| |_______| \_______/ |_______| \______/
