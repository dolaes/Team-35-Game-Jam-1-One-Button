title = "UPPERS";

description = `
[Tap] to Move
`;

characters = [];

options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  seed: 420,
};

let bigCircle;
let nextCircleDist;
let playerCircle;
let flyingTicks;
let multiplier;
let stars;

function update() {
  if (!ticks) {
    bigCircle = [{ pos: vec(50, 0), radius: 2, isDestroyed: false }];
    nextCircleDist = 10;
    playerCircle = {
      anotherCircle: bigCircle[0],
      angle: PI,
      av: 1.5,
      pos: vec(50, 0),
      target: vec(50, 0),
    };
    flyingTicks = 0;
    multiplier = 1;
    stars = times(20, () => {
      return { pos: vec(rnd(99), rnd(99)), vy: rnd(3, 6) };
    });
  }
  let scr = sqrt(difficulty) * 0.05;
  flyingTicks = clamp(flyingTicks - difficulty, 1, 99);
  if (playerCircle.anotherCircle.pos.y < 70) {
    scr += (69 - playerCircle.anotherCircle.pos.y) * (0.1 / flyingTicks);
  }
  color("yellow");
  stars.forEach((s) => {
    s.pos.y += scr / s.vy;
    if (s.pos.y > 99) {
      s.pos.set(rnd(99), 0);
      s.vy = rnd(3, 6);
    }
    rect(s.pos, 1, 1);
  });
  nextCircleDist -= scr;
  while (nextCircleDist < 0) {
    const radius = rnd(4, 9);
    bigCircle.push({
      pos: vec(rnd(10 + radius, 90 - radius), nextCircleDist - 40),
      radius,
      isDestroyed: false,
    });
    nextCircleDist += radius * rnd(1, 2);
  }
  playerCircle.angle += difficulty * 0.03 * playerCircle.av;
  color("cyan");
  bar(playerCircle.anotherCircle.pos, 99, 4, playerCircle.angle, -playerCircle.anotherCircle.radius * 0.015);
    particle(playerCircle.anotherCircle.pos, 2, 1, playerCircle.angle, -playerCircle.anotherCircle.radius);
  color("black");
  let nextPlanet;
  let maxDist = 0;
  let piercedPlanets = [playerCircle.anotherCircle];
  remove(bigCircle, (p) => {
    if (p.isDestroyed) {
      particle(p.pos, ceil(p.radius * 4), sqrt(p.radius) * 0.5);
      return true;
    }
    p.pos.y += scr;
    const c = arc(p.pos, p.radius).isColliding.rect;
    if (p !== playerCircle.anotherCircle && c.black) {
      return true;
    }
    if (p !== playerCircle.anotherCircle && p.pos.y > -p.radius - 4 && c.cyan) {
      piercedPlanets.push(p);
      const d = p.pos.distanceTo(playerCircle.anotherCircle.pos);
      if (d > maxDist) {
        nextPlanet = p;
        maxDist = d;
      }
    }
    return p.pos.y > 100 + p.radius * 2;
  });
  if (input.isJustPressed) {
    if (nextPlanet == null) {
      play("explosion");
      for (let i = 0; i < 99; i++) {
        playerCircle.pos.addWithAngle(playerCircle.angle, 3);
        if (!playerCircle.pos.isInRect(5, 5, 95, 95)) {
          break;
        }
      }
      end();
    } else {
      play("jump");
      if (multiplier > 1) {
        multiplier--;
      }
      if (piercedPlanets.length > 2) {
        play("tone");
      }
      piercedPlanets.forEach((p) => {
        if (p !== nextPlanet) {
          p.isDestroyed = true;
          addScore(multiplier, p.pos);
          multiplier++;
        }
      });
      playerCircle.anotherCircle = nextPlanet;
      playerCircle.angle += PI;
      playerCircle.av *= -1;
      flyingTicks = 20;
    }
  }
  const a = playerCircle.angle;
  playerCircle.target.set(playerCircle.anotherCircle.pos).addWithAngle(a, playerCircle.anotherCircle.radius);

  if (playerCircle.anotherCircle.pos.y - playerCircle.anotherCircle.radius > 99) {
    play("explosion");
    end();
  }
}
