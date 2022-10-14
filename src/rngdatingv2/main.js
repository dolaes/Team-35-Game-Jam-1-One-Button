title = "RNG DATING SIM V2";

const descriptions = [
    "Better luck than real life",
    "The only chance you'll get",
    "Probably the best dating sim",
    "Dating go brrrrr",
];

description = descriptions[Math.floor(Math.random() * descriptions.length)];

characters = [
    `
 R R
RRRRR
RRRRR
 RRR
  R`,
`
rrrr
rrrr
rrrr
rrrr
`,
`
gggg
gggg
gggg
gggg
`
];

const G = {
	WIDTH: 320,
	HEIGHT: 260,
    HEART_X: 130,
    HEART_Y: 100
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT },
	seed: 300,
    isShowingScore: false,
    // isShowingTime: true,
    isPlayingBgm: true,
	theme: 'simple' // fancy themes don't work
};

// Image stuffs outside of the init area because 
// we don't want to reload it on every game restart
/**
 * @typedef { string[] }
 */
const imagesrc = [
	"imgs/blue.png",
	"imgs/pink.png",
	"imgs/purple.png",
    "imgs/light_purple.png"
];

/**
 * @typedef { HTMLImageElement[] }
 */
const images = imagesrc.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
});

/**
 * @typedef { number }
 */
let rndGirl;

/**
 * @type { CanvasRenderingContext2D }
 */
let ctx;


const boturl = "https://devman.kuki.ai/talk";
const botkey = "bbdaae8a54414fa6b63fd3243ac9fdae7678a3162b524b836e184063da6c8dbf";


class Bot {
    /**
     * Create a Bot
     * @param {string} client_name 
     */
    constructor(client_name) {
        this.hasLatest = false;
        this.client_name = client_name;
        this.latestOutput = [];
        this.sessionid = null;
    }

    /**
     * Generate some new text
     * @param {string} input Input to response to
     * @param {number} lines How many responses to create
     */
    async newDialog(input, lines = 1) {
        this.hasLatest = false;

        const params = new URLSearchParams({
            'botkey': botkey,
            'input': input,
            'client_name': this.client_name
        });

        /**
         * @type { string[] }
         */
        const output = [];

        // this might work super well on first run
        // because the sessionid might be different
        // i /think/ that only resetting on i == 0 
        // should avoid the issue
        for (let i = 0; i < lines; i++) {
            if (this.sessionid) {
                params.set("sessionid", this.sessionid);
            } else if (i == 0) {
                params.set('reset', 'true');
            }
            fetch(boturl, {
                method: 'POST',
                headers:{
                'Content-Type': 'application/x-www-form-urlencoded'
                },    
                body: params,
            }).then((response) => {
                return response.json();
            }).then((data) => {
                this.sessionid = data.sessionid;
                if (data.responses[0] !== "") {
                    output.push(data.responses[0]); // only get the first
                } else {
                    lines++;
                }
                
    
                lines--;
                if (lines <= 0) { 
                    this.hasLatest = true;
                }            
            });
        }

        this.latestOutput = output;
    }
}


/**
 * @type { number }
 */
let highlight;
/**
 * @type { string }
 */
let chosen;

/**
 * @type { number }
 */
let chosentime;

/**
 * @type { Bot }
 */
let girlbot, playerbot;
/**
 * @type { boolean }
 */
let girlspoken = false, playerspoken = false;

/**
 * @typedef {{
 * pos: Vector
 * }} Heart
 */

/**
 * @type {Heart []}
 */
let hearts;

function textWrap(str, xpos, ypos) {
    const words = str.split(' ');
    const lineend = (0.95 * G.WIDTH);

    let cx = xpos, cy = ypos;
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (cx + word.length * 6 >= lineend) {
            cy += 0.05 * G.HEIGHT;
            cx = xpos;
        }
        text(word + " ", cx, cy);
        cx += 6 * (word.length + 1);
    }
}

// Random(ish) 4 numbers to append to client name
const botnum = Date.now() % 10000;

function update() {
	if (!ticks) {
		rndGirl = Math.floor(Math.random() * images.length);

		const canvas = document.getElementsByTagName('canvas')[0];
		ctx = canvas.getContext("2d");

        highlight = 0;

        // OK to reuse the numbers because
        // we reset in the function
        girlbot = new Bot("slotsim-girl" + botnum.toString());
        playerbot = new Bot("slotsim-player" + botnum.toString());

        girlbot.hasLatest = false;
        playerbot.hasLatest = false;

        girlbot.newDialog("Hello.");

        chosentime = 300;

        hearts = [];
        const num_hearts = rnd(3,7);
        for(let i = 0; i < num_hearts; i++) {
            hearts.push({
                pos: vec(G.HEART_X + (i * 10), G.HEART_Y)
            });
        }
    }

    chosentime += 1;

	// Draw the anime girl
	let girl = images[rndGirl];
	if (girl) {
        const width = 2 * girl.width;
        const height = 2 * girl.height;
		const xpos = 0.05 * G.WIDTH;
		const ypos = 0.05 * G.HEIGHT;
        color("light_black");
        rect(xpos - 4, ypos - 4, width, height);
		ctx.drawImage(girl, xpos, ypos, width, height);
	}

    

    if (chosentime >= 100) {
        if (girlbot.hasLatest && !girlspoken) {
            console.log(girlbot.latestOutput);
            girlspoken = true;
            playerbot.newDialog(girlbot.latestOutput[0], 3);
        }
    
        if (playerbot.hasLatest && !playerspoken) {
            playerspoken = true;
            console.log(playerbot.latestOutput);
        }

        if (girlbot.hasLatest) {
            const str = girlbot.latestOutput[0];
            const xpos = 0.45 * G.WIDTH;
            const ypos = 0.15 * G.HEIGHT;
            color("black");
            textWrap(str, xpos, ypos);
            
       }
        
        // OPTIONS
        color('yellow');
        text("RESPOND", 0.05 * G.WIDTH, 0.5 * G.HEIGHT, {scale: {x:2,y:2}});
    
        if (playerbot.hasLatest) {
            const scale = { x: 1, y: 1 };
            const yinc = 5 * 6 * scale.y; 
            const choices = playerbot.latestOutput;
            //const choices = descriptions.slice(0, 3);
            for (let i = 0; i < choices.length; i++) {
                const str = '"' + choices[i] + '"';
                const strlen = 6 * str.length; // width of the text string
                const xpos = 0.05 * G.WIDTH + 3;
                const ypos = 0.6 * G.HEIGHT + i * yinc;
                const lineend = (0.95 * G.WIDTH);
                // TODO: wrap text
                color("black");
                textWrap(str, xpos, ypos);
                if (highlight === i) {
                    color('light_purple');
                    if(strlen < (lineend - xpos)) {
                        rect(xpos - 5, ypos + 5, (strlen), 5);
                    } else {
                        rect(xpos - 5, ypos + 5 , (lineend - xpos), 5);
                    }
                }
                // text(str, xpos, ypos, {scale: scale} );
                if(i == 0 || i == 2) {
                    char("b", xpos - 5, ypos);
                } else {
                    char("c", xpos - 5, ypos);
                }
                 
            }
            if (ticks % 2 == 0) {
                highlight = (highlight + 1) % choices.length;
            }
        
            if(input.isJustPressed) {
                girlspoken = false;
                playerspoken = false;
    
                girlbot.hasLatest = false;
                playerbot.hasLatest = false;
                
                girlbot.newDialog(choices[highlight]);
                chosen = choices[highlight];
                if(highlight == 0 || highlight == 2) {
                    hearts.pop();
                } else {
                    hearts.push({pos: vec(G.HEART_X + (hearts.length * 10), G.HEART_Y)});
                }
                if(hearts.length == 0) {
                    end();
                }
                console.log(highlight);
                chosentime = 0;
            }

            hearts.forEach((h) => {
                char("a", h.pos.x, h.pos.y);
            });
       }
    } else {
        const scale = { x: 2, y: 2 };
        const str = '"' + chosen + '"';
        const strlen = 6 * str.length; // width of the text string
        const xpos = 0.05 * G.WIDTH + 3;
        const ypos = 0.75 * G.HEIGHT;
        if(highlight == 0 || highlight == 2) {
            color("red")
            char("b", xpos - 5, ypos);
        } else {
            color("green");
            char("c", xpos - 5, ypos);
        }
        color("black");
        textWrap(str, xpos, ypos);
    }
    
}
