title = "MORSE";

description = `tap the morse code`;

characters = [
//dot
`
 ll
llll
llll
 ll
`,
//dash center
`
llll
llll
llll
llll
`,
//dash front
`
 lll
llll
llll
 lll
`,
//dash back
`
lll
llll
llll
lll
`
];

const G = {
	WIDTH: 200,
	HEIGHT: 100,

	PLAYER_SIZE: 6,

	TILE_BASE_SPEED: 1.0,

	DOT: 1,
	DASH: 10,

	COOLDOWN: 30,
	SPAWN_COOLDOWN: 3
};

options = {
	viewSize: { x: G.WIDTH, y: G.HEIGHT },
	seed: 4
};

let morse_code;
let current_morse;
let current_index;

let black_tiles;
let char_index;
let code_type; //true = dot false = dash

let cooldown;
let spawn_cooldown;

function update() {
	if (!ticks) {
		morse_code = [1,1,1,1,1,1,10,1,1,1,10,1,1,10,10,10,1,10,10,10,10,10,1,10,1,1,10,1,1,10,1,1];
		current_morse = morse_code[0];
		if(current_morse == G.DOT) {
			code_type = true;
		} else {
			code_type = false;
		}
		current_index = 0;

		cooldown = G.COOLDOWN;
		spawn_cooldown = G.SPAWN_COOLDOWN;

		black_tiles = [];
	}

	color("light_black");
	box(G.WIDTH / 6, G.HEIGHT / 2.8, 30, 60);
	color("black");
	box(G.WIDTH / 6, G.HEIGHT / 3, 6, 25);

	if (input.isPressed) {
		color("green");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.PLAYER_SIZE);
	} else {
		color("black");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.PLAYER_SIZE);
	}

	if (current_morse > 0 && spawn_cooldown == 0) {
		if(code_type) {
			char_index = "a";
		} else {
			if(current_morse == G.DASH) {
				char_index = "c"
			} else if(current_morse == G.DOT) {
				char_index = "d"
			} else {
				char_index = "b"
			}

		}
		black_tiles.push({ pos: vec(G.WIDTH, G.HEIGHT / 2), type: char_index });
		current_morse--;
		spawn_cooldown = G.SPAWN_COOLDOWN;
	}
	if (current_morse == 0 && cooldown > 0) {
		cooldown--;
	}
	if (current_morse == 0 && cooldown == 0) {
		current_index++;
		current_morse = morse_code[current_index];
		if(current_morse == G.DOT) {
			code_type = true;
		} else {
			code_type = false;
		}
		cooldown = 30;
	}
	if(spawn_cooldown > 0) {
		spawn_cooldown--;
	}

	if(current_index == morse_code.length && black_tiles.length == 0) {
		setTimeout(() => {
			end();
			color("black");
			text("\"Hello world\"", G.WIDTH/3.1, G.HEIGHT - 30)
		}, 1000);

	}
	remove(black_tiles, (b) => {
		b.pos.x -= G.TILE_BASE_SPEED;
		color("black");

		const isCollidingWithPlayer = char(b.type, b.pos.x, b.pos.y).isColliding.rect.green;

		if (isCollidingWithPlayer) {
			color("yellow");
			particle(b.pos);
			addScore(10, b.pos);
			play("tone");
		}

		if (b.pos.x < 0) {
			end();
		}

		return (b.pos.x < 0 || isCollidingWithPlayer);
	});
	
}

