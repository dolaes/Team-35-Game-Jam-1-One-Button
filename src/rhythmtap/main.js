title = "Rhythm Tap";

description = `to the beat!`;

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
lllll
lllll
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

	TILE_BASE_SPEED: 1,

	DOT: 1,
	DASH: 5,

	COOLDOWN: 30,
	SPAWN_COOLDOWN: 3,

	TIME_BUFFER: 100
};

options = {
	viewSize: { x: G.WIDTH, y: G.HEIGHT },
	isReplayEnabled: true,
	captureCanvasScale: 4,
	isCapturingGameCanvasOnly: true,
	seed: 4
};

class HitObject {
    constructor(time, type, length = 0) {
        this.time = time;
        this.type = type;
        this.length = length;
		this.pressed = false;
		this.presstime = 0;
    }
}

class Song {

    constructor(folderpath, osufilename) {
        this.folderpath = folderpath;
        this.osufile = osufilename;
        this.hitobjects = [];
		this.slidervelocity = [];
        this.loaded = false;
        this.audio = null;
        this.playing = false;

        fetch(folderpath + "/" + osufilename)
            .then(response => response.text())
            .then(text => this.processText(text));
            // outputs the content of the text file
    }

    /**
     * 
     * @param {string} text 
     */
    processText(text) {
        // console.log(text);
        const lines = text.split('\n');
        let section = "";

        let audiofile = "";
        let leadin = 0;
        let beatlength = 0;
		let slidermult = 0;

        const GeneralFunc = (line) => {
            if (line.startsWith("AudioFilename")) {
                audiofile = line.substring(line.indexOf(':') + 1);
                audiofile = audiofile.trim();
            }
            if (line.startsWith("AudioLeadIn")) {
                leadin = Number(line.substring(line.indexOf(':') + 1));
            }
        };

        const HitObjFunc = (line) => {
            // x,y,time,type,hitSound,objectParams,hitSample
            const args = line.split(',');
            const time = Number(args[2]) + leadin;
            let type;
            const num = Number(args[3]);
            let length = 1;
            if ((num & 1) !== 0) {
                type = "circle";
            } else if ((num & (1 << 1)) !== 0) {
                type = "slider";
				// console.log(line);
				// console.log(args);
                length = Number(args[7]) * Number(args[6]);; // TODO: cry
            } else if ((num & (1 << 3)) !== 0) {
                // x,y,time,type,hitSound,endTime,hitSample
                type = "spinner";
                length = Number(args[5]) - time; 
            } else {
                // ayo??????
            }
			//console.log(length);
            this.hitobjects.push(new HitObject(time, type, length));
        };

        const TimingFunc = (line) => {
            // time,beatLength,meter,sampleSet,sampleIndex,volume,uninherited,effects
            const args = line.split(',');
            if (beatlength === 0) {
                beatlength = Number(args[1]);
            } else {
				// slider velo
				const neginv = Number(args[1]) / 100;
				const time = Number(args[0]);
				this.slidervelocity.push([time, slidermult / -neginv]);
			}
        };

		const DifficultyFunc = (line) => {
			if (line.startsWith("SliderMultiplier")) {
				slidermult = Number(line.substring(line.indexOf(':') + 1).trim());
			}
		};

        for (const line of lines) {
            //console.log(line);
            if (line.startsWith('[')) {
                section = line.substring(1, line.lastIndexOf(']'));
            //    console.log(section);
            } else {
                switch(section) {
                    case "General" :
                        GeneralFunc(line);
                        break;
                    case "HitObjects":
                        HitObjFunc(line);
                        break;
                    case "TimingPoints":
                        TimingFunc(line);
                        break;
					case "Difficulty":
						DifficultyFunc(line);
						break;
                    default: break;
                }
            }
            
        }

        // console.log("Finished Parsing .osu file");

        this.loadAudio(audiofile);
		this.leadin = leadin;
		this.slidermult = slidermult;
		this.beatlength = beatlength;
    }

    loadAudio(filename) {
        this.audio = new Audio(this.folderpath + "/" + filename);
        this.audio.load();
		this.audio.volume = 0.1;
        this.loaded = true;
    }
}

const songs = [
    new Song("songs/amamichi", "Otokaze - Amamichi (UnLock-) [Light Hard].osu"),
    new Song("songs/dadada", "Hige Driver join. SELEN - Dadadadadadadadadada (spboxer3) [INSANE].osu"),
    new Song("songs/golddust", "DJ Fresh - Gold Dust (galvenize) [Insane].osu"),
    new Song("songs/highscore", "Panda Eyes & Teminite - Highscore (Fort) [Game Over].osu"),
    new Song("songs/marblesoda", "Shawn Wasabi - Marble Soda (Len) [Narcissu's Insane].osu")
];
const song = songs[Math.floor(Math.random() * songs.length)];

let current_object;
let current_length;
let current_index;
let current_time;

let black_tiles;
let char_index;
let code_type; //true = dot false = dash

let cooldown;
let spawn_cooldown;

function update() {
	if (!ticks) {
		console.log(song);

		current_index = 0;
		current_object = song.hitobjects[current_index];
		current_length = current_object.length;
		if(current_length == G.DOT) {
			code_type = true;
		} else if (current_length == G.DASH) {
			code_type = false;
		}
	}

	if (song.loaded) {
        if (!song.playing) {
            song.audio.play();
            song.playing = true;
        } else if (song.audio.ended) {
			end();
		}
		
    }

	current_time = (song.audio.currentTime*1000).toFixed(0);
	current_time = Number(current_time);
	if (ticks % 30 === 0) {
	//	console.log(current_time);
	}

	// color('light_green');
	// rect(G.WIDTH / 6 + G.TIME_BUFFER / 10, G.HEIGHT / 2, 2, 100);
	// color('light_red');
	// rect(G.WIDTH / 6 - G.TIME_BUFFER / 10, G.HEIGHT / 2, 2, 100);
	
	let validpress = false;
	let pressobj = null;

	const firsti = Math.max(0, current_index - 10);
	const lasti = Math.min(song.hitobjects.length, current_index + 10);
	for (let i = firsti; i < lasti; i++) {
		const obj = song.hitobjects[i];
		if (obj.pressed && obj.type === 'circle') continue;
		let xpos = G.WIDTH / 6 + (obj.time - current_time) / 10;
		if (obj.presstime !== 0) {
			xpos = G.WIDTH / 6;
		}
		if (xpos > G.WIDTH) {
			break;
		}
		if (xpos < 0) {
			continue;
		}
		if (current_time <= obj.time + G.TIME_BUFFER && current_time >= obj.time - G.TIME_BUFFER) {
			color('black');
			if (!obj.pressed && !validpress) {
				validpress = true;
				pressobj = obj;
			}
		} else {
			color('black');
		}
		
		switch(obj.type) {
			case "circle": 
				char('a', xpos, G.HEIGHT / 2);
				break;
			case "spinner":
			case "slider": 
				let sv = Number(song.slidervelocity[0][1]);
				for (let i = 0; i < song.slidervelocity.length - 1; i++) {
					if (song.slidervelocity[i + 1][0] > obj.time) {
						sv = Number(song.slidervelocity[i][1]);
						break;
					}
				}
				// console.log("objl", obj.length);
				// console.log("sm", song.slidermult);
				// console.log("sv", sv);
				// console.log("s.bl", song.beatlength);
				let length = obj.length / (song.slidermult * 100 * sv) * song.beatlength;
				if (obj.type !== 'circle' && obj.presstime !== 0) {
					length += (obj.presstime - current_time);
				}
				// console.log("l", length);
				for (let i = xpos; i <= xpos + length / 10; i += 4) {
					char('b', i, G.HEIGHT / 2);
				}
				char('c', xpos - 1, G.HEIGHT / 2);
				//char('d', xpos + length / 10, G.HEIGHT / 2);
				break;
		}
		
	}

	if (input.isJustPressed || (pressobj && input.isPressed && pressobj.type !== 'circle')) {
		color("cyan");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.PLAYER_SIZE);
		if (validpress) {
			addScore(10);
			pressobj.pressed = true;
			pressobj.presstime = current_time;
		} else {
			addScore(-10);
		}
	} else {
		color("cyan");
		box(G.WIDTH / 6, G.HEIGHT / 2, G.PLAYER_SIZE, G.PLAYER_SIZE);
	}

	if (current_object.time < current_time + G.TIME_BUFFER || current_object.pressed) {
		current_index++;
		//console.log(current_object.time);
		//console.log(current_time - G.TIME_BUFFER, current_time - G.TIME_BUFFER);
		//console.log(current_index);
		current_object = song.hitobjects[current_index];
		current_length = current_object.length;
		if(current_length == G.DOT) {
			code_type = true;
		} else {
			code_type = false;
		}
		
	}
}
