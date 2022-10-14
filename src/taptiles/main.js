title = "TAP TILES";

description = `tap when the bar meets the blocks`;

const G = {
	WIDTH: 200,
	HEIGHT: 100,

	PLAYER_SIZE: 4,

	TILE_WIDTH: 6,
	TILE_HEIGHT: 6,
	TILE_BASE_SPEED: 1.0
};

options = {
	viewSize: { x: G.WIDTH, y: G.HEIGHT },
	seed: 4,
    isPlayingBgm: true,
};

let black_tiles;
let red_tiles;
let current_tile_speed;

function update() {
	if (!ticks) {
		black_tiles = [];
		current_tile_speed = G.TILE_BASE_SPEED;
	}

	if (input.isPressed) {
		color("green");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.HEIGHT);
	} else {
		color("black");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.HEIGHT);
	}

	if (rnd(0, 1) < 0.02) {
		black_tiles.push({ pos: vec(G.WIDTH, G.HEIGHT / 2) });
	}

	remove(black_tiles, (b) => {
		b.pos.x -= current_tile_speed;
		color("black");

		const isCollidingWithPlayer = box(b.pos.x, b.pos.y, G.TILE_WIDTH, G.TILE_HEIGHT).isColliding.rect.green;

		if (isCollidingWithPlayer) {
			play("tone");
			color("yellow");
			particle(b.pos);
			addScore(10, b.pos);
		}

		if (b.pos.x < 0) {
			end();
		}

		return (b.pos.x < 0 || isCollidingWithPlayer);
	});
}
