import { Graphics, Container } from "pixi.js";

export function createStarfield(width, height, count = 200) {
  const container = new Container();
  
  for (let i = 0; i < count; i++) {
    const star = new Graphics();
    const size = Math.random() * 1.5 + 0.5;
    star.circle(0, 0, size);
    
    const brightness = Math.random() * 0.5 + 0.5;
    star.fill(0xffffff);
    star.alpha = brightness;
    
    star.x = Math.random() * width * 3 - width;
    star.y = Math.random() * height * 3 - height;
    
    container.addChild(star);
  }
  
  return container;
}

export function createTwinklingStars(width, height, count = 100) {
  const stars = [];
  const container = new Container();
  
  for (let i = 0; i < count; i++) {
    const star = new Graphics();
    const size = Math.random() * 1 + 0.3;
    star.circle(0, 0, size);
    star.fill(0xffffff);
    
    star.x = Math.random() * width * 2 - width / 2;
    star.y = Math.random() * height * 2 - height / 2;
    star.alpha = Math.random() * 0.8 + 0.2;
    star.targetAlpha = Math.random() * 0.8 + 0.2;
    star.twinkleSpeed = Math.random() * 0.02 + 0.01;
    
    container.addChild(star);
    stars.push(star);
  }
  
  return { container, stars };
}

export function updateTwinklingStars(stars) {
  for (const star of stars) {
    star.alpha += (star.targetAlpha - star.alpha) * star.twinkleSpeed;
    
    if (Math.abs(star.targetAlpha - star.alpha) < 0.02) {
      star.targetAlpha = Math.random() * 0.8 + 0.2;
    }
  }
}
