export const keys = {};
export let mousePos = { x: 0, y: 0 };

const SPEED_LEVELS = [0, 3, 5, 7, 10];
const ROTATION_SPEED = 0.1;

export function setupInputListener(onShoot, canvas, ship, world, screenWidth, screenHeight) {
  ship.vx = 0;
  ship.vy = 0;
  ship.speedLevel = 0;
  ship.rotationVelocity = 0; // Accumulating rotation speed
  
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
  });

  // Mouse click: Ateş et
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // Prevent page scroll
      const dirX = Math.cos(ship.rotation - Math.PI / 2);
      const dirY = Math.sin(ship.rotation - Math.PI / 2);
      
      onShoot(ship.x, ship.y, dirX, dirY);
    }
  });
}

export function handleMovement(ship) {
  // W: Increase speed level (forward)
  if (keys["w"] || keys["W"]) {
    ship.speedLevel = Math.min(4, ship.speedLevel + 0.15);
  }
  // S: Decrease speed level (reverse/brake)
  if (keys["s"] || keys["S"]) {
    ship.speedLevel = Math.max(0, ship.speedLevel - 0.15);
  }
  
  // Get current speed from level (no friction - space physics)
  const currentSpeed = SPEED_LEVELS[Math.floor(ship.speedLevel)] + 
    (SPEED_LEVELS[Math.ceil(ship.speedLevel)] - SPEED_LEVELS[Math.floor(ship.speedLevel)]) * 
    (ship.speedLevel % 1);
  
  // Calculate forward direction based on ship rotation
  const forwardX = Math.sin(ship.rotation);
  const forwardY = -Math.cos(ship.rotation);
  
  // A: Strafe left / D: Strafe right
  const strafeX = Math.cos(ship.rotation);
  const strafeY = Math.sin(ship.rotation);
  
  // Apply forward velocity (maintains direction from rotation)
  ship.vx = forwardX * currentSpeed;
  ship.vy = forwardY * currentSpeed;
  
  // Add strafe movement (perpendicular)
  if (keys["a"] || keys["A"]) {
    ship.vx -= strafeX * (ship.moveSpeed * 0.7);
    ship.vy -= strafeY * (ship.moveSpeed * 0.7);
  }
  if (keys["d"] || keys["D"]) {
    ship.vx += strafeX * (ship.moveSpeed * 0.7);
    ship.vy += strafeY * (ship.moveSpeed * 0.7);
  }
  
  // Update position
  ship.x += ship.vx;
  ship.y += ship.vy;
}

// Yön tuşları ile geminin yönünü döndür (progressive acceleration)
export function updateShipRotation(ship) {
  // Arrow Left: Döner sol
  if (keys["ArrowLeft"]) {
    ship.rotationVelocity = Math.max(-0.08, ship.rotationVelocity - 0.01);
  }
  // Arrow Right: Döner sağ
  else if (keys["ArrowRight"]) {
    ship.rotationVelocity = Math.min(0.08, ship.rotationVelocity + 0.01);
  }
  // Decelerate when no key pressed
  else {
    ship.rotationVelocity *= 0.9;
  }
  
  // Apply rotation
  ship.rotation += ship.rotationVelocity;
}
