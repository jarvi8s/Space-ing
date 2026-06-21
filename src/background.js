import { Graphics, Container } from "pixi.js";

export function createParallaxLayers() {
  const layers = [];
  
  // 3 parallax layer
  const distances = [3, 2, 1.5];
  const colors = [0x0a0a1f, 0x0f0f2a, 0x151540];
  
  for (let i = 0; i < 3; i++) {
    const layer = new Graphics();
    layer.rect(0, 0, 3000, 3000);
    layer.fill(colors[i]);
    layer.distance = distances[i];
    layers.push(layer);
  }
  
  return layers;
}

export function updateParallaxBackground(layers, ship, world) {
  // Parallax offset - ship'in hareketi katına göre farklı hızda yansıtılır
  for (const layer of layers) {
    layer.x = -ship.x / layer.distance;
    layer.y = -ship.y / layer.distance;
  }
}

export function createNebulaClouds() {
  const container = new Graphics();
  
  // Gradient-like nebula effect with overlapping circles
  const colors = [0xff006e, 0x8338ec, 0x3a86ff];
  
  for (let i = 0; i < 10; i++) {
    const cloud = new Graphics();
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    cloud.circle(0, 0, Math.random() * 200 + 100);
    cloud.fill(color);
    cloud.alpha = 0.1;
    
    cloud.x = Math.random() * 3000 - 1500;
    cloud.y = Math.random() * 3000 - 1500;
    
    container.addChild(cloud);
  }
  
  return container;
}
