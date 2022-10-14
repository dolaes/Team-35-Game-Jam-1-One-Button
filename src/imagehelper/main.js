title = "image helper";

description = `
anime :) tap to change picture
`;

characters = [
];

const G = {
	WIDTH: 100,
	HEIGHT: 100,
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT },
	seed: 2,
	theme: 'simple' // other themes have wack colors
};

class ImageHelper {
	constructor(url, width, height) {
		this.width = width;
		this.height = height;

		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext('2d');

		const img = new Image();
		img.onload = () => {
			this.ctx.drawImage(img, 0, 0);
			this.quantize();
		};
		img.src = url;
	}

	quantize() {
		this.colors = [];
		const data = this.ctx.getImageData(0, 0, this.width, this.height).data;
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i+1];
			const b = data[i+2];
			const a = data[i+3]; // ignore alpha

			this.colors.push(this.closestColor(r, g, b));						
		}
	}

	closestColor(r, g, b) {
		const colors = {
			"white": [238, 238, 238],
			"red": [233, 30, 99],
			"green": [76, 175, 80],
			"yellow": [255, 193, 7],
			"blue": [64, 81, 181],
			"purple": [156, 39, 176],
			"cyan": [3, 169, 244],
			"black": [97, 97, 97],
			"light_red": [235, 134, 168],
			"light_green": [157, 206, 159],
			"light_yellow": [246, 215, 122],
			"light_blue": [150, 159, 209],
			"light_purple": [197, 138, 207],
			"light_cyan": [120, 203, 241],
			"light_black": [167, 167, 167],
		};

		let fClosest = Infinity;
		let pClosest;

		for (const c in colors) {
			const dr = r - colors[c][0];
			const dg = g - colors[c][1];
			const db = b - colors[c][2];

			const dist2 = dr*dr + dg*dg + db*db;
			if (dist2 < fClosest) {
				fClosest = dist2;
				pClosest = c;
			}
		}

		return pClosest;
	}

	getPixel(x, y) {
		return this.ctx.getImageData(x, y, 1, 1).data;
	}

	draw(x, y) {
		let i = 0;
		for (let py = 0; py < this.height; py++) {
			for (let px = 0; px < this.width; px++) {
				color(this.colors[i]);
				rect(px + x, py + y, 1, 1);
				i++;
			}
		}
	}
}

// Image stuffs outside of the init area because 
// we don't want to reload it on every game restart
/**
 * @type { ImageHelper[] }
 */
const images = [
	new ImageHelper('imgs/smallanime.png', 50, 50), 
	new ImageHelper('imgs/choco50.jpg', 50, 50), 
	new ImageHelper('imgs/ame50.png', 50, 50)
];

/**
 * @type { string[] }
 */
const strings = [
	"B-b-baka !!!",
	"Anime :)",
	"I'm not a weeb",
]

/**
 * @type { number }
 */
let index;

function update() {
	if (!ticks) {
		index = 0;
	}

	const startTime = Date.now(); // for fps calc

	// Draw the anime girl
	const img = images[index];
	img.draw(G.WIDTH / 2 - img.width / 2, G.HEIGHT / 2 - 0.8 * img.height);

	// Draw the text
	color('black');
	const str = strings[index];
	const strlen = 6 * (str.length - 1); // width of the text string
	text(str, G.WIDTH / 2 - strlen / 2, 0.7 * G.HEIGHT);

	// Switch to next scene
	if (input.isJustPressed) {
		index = (index + 1) % images.length;
		addScore(100); // why not
	}
	
	// Whoo big numbers bb!
	const fps = 1000 / (Date.now() - startTime);
	text(fps.toFixed(0) + "FPS", 4, G.HEIGHT - 5);
}
