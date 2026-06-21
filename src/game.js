import { Application, Container, Text, TextStyle, Graphics } from "pixi.js";
import { createShip, createEnemy, createBullet } from "./entities.js";
import { setupInputListener, handleMovement, updateShipRotation } from "./input.js";
import { checkBulletCollisions, updateBullets, updateCamera } from "./physics.js";
import { createMinimap, updateMinimap } from "./minimap.js";
import { createStarfield, createTwinklingStars, updateTwinklingStars } from "./stars.js";
import { createAsteroids, updateAsteroids } from "./asteroids.js";
import { createBulletTrail, updateTrails } from "./bulletTrail.js";
import { createParallaxLayers, updateParallaxBackground, createNebulaClouds } from "./background.js";

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

export async function startGame() {
  // Initialize app
  const app = new Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    background: "#000000",
  });

  document.body.innerHTML = "";
  document.body.appendChild(app.canvas);

  // Create background layers (parallax)
  const parallaxLayers = createParallaxLayers();
  parallaxLayers.forEach(layer => app.stage.addChild(layer));

  // Create nebula clouds
  const nebula = createNebulaClouds();
  app.stage.addChild(nebula);

  // Create starfield (static)
  const starfield = createStarfield(SCREEN_WIDTH, SCREEN_HEIGHT, 300);
  app.stage.addChild(starfield);

  // Create twinkling stars
  const { container: twinklingStarsContainer, stars: twinklingStars } = createTwinklingStars(SCREEN_WIDTH, SCREEN_HEIGHT, 150);
  app.stage.addChild(twinklingStarsContainer);

  // Create world
  const world = new Container();
  app.stage.addChild(world);

  // Create asteroids
  const { container: asteroidsContainer, asteroids } = createAsteroids(20);
  world.addChild(asteroidsContainer);

  // Create minimap (stays on screen, not in world)
  const minimap = createMinimap();
  app.stage.addChild(minimap);

  // Create entities
  const ship = createShip("balanced");
  const enemy = createEnemy("fast");
  const bullets = [];
  const trails = [];

  world.addChild(ship);
  world.addChild(enemy);

  // Setup input and bullet type switching
  const shootFunction = (shipX, shipY, dirX, dirY) => {
    const bullet = createBullet(shipX, shipY, dirX, dirY, ship.bulletType);
    bullets.push(bullet);
    world.addChild(bullet);
  };
  
  setupInputListener(shootFunction, app.canvas, ship, world, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Bullet type switching with keys
  window.addEventListener("keydown", (e) => {
    if (e.key === "1") ship.bulletType = "light";
    if (e.key === "2") ship.bulletType = "heavy";
  });

  // Health and speed display
  const infoText = new Text({
    text: `Enemy HP: ${enemy.health}`,
    style: new TextStyle({
      fontSize: 16,
      fill: 0xffffff
    })
  });
  infoText.x = 10;
  infoText.y = 10;
  app.stage.addChild(infoText);

  // Title
  const titleText = new Text({
    text: "          SPACE",
    style: new TextStyle({
      fontSize: 24,
      fill: 0x00ff00,
      fontWeight: "bold"
    })
  });
  titleText.x = SCREEN_WIDTH / 2 - 100;
  titleText.y = 5;
  app.stage.addChild(titleText);

  // Game loop
  app.ticker.add(() => {
    // Update parallax background
    updateParallaxBackground(parallaxLayers, ship, world);

    // Update camera
    updateCamera(world, ship, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Update ship rotation
    updateShipRotation(ship);

    // Handle player movement
    handleMovement(ship);

    // Update asteroids
    updateAsteroids(asteroids);

    // Update twinkling stars
    updateTwinklingStars(twinklingStars);

    // Update bullets (pass world for removal)
    updateBullets(bullets, world);

    // Create bullet trails
    for (const bullet of bullets) {
      if (Math.random() < 0.6) {
        const trail = createBulletTrail(bullet);
        trails.push(trail);
        world.addChild(trail);
      }
    }

    // Update trails
    updateTrails(trails, world);

    // Check collisions
    checkBulletCollisions(bullets, enemy, world);

    // Update minimap
    updateMinimap(minimap, ship, enemy, bullets, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Calculate current speed
    const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);

    // Update info display
    infoText.text = `Speed: ${speed.toFixed(1)} | Enemy HP: ${Math.max(0, enemy.health)} | Bullet: ${ship.bulletType === "light" ? "1-Light" : "2-Heavy"}`;
  });

  return app;
}

// Start the game
startGame();
