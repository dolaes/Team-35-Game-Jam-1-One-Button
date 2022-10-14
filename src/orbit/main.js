title = "circle";

description = `
Circle
`;
characters = [];

const G = {
    WIDTH: 240,
    HEIGHT: 240
};

options = {
    viewSize: { x: G.WIDTH, y: G.HEIGHT },
    isShowingScore: false,
    theme: "shape"
};

function update() {
    if (!ticks) {
    }

    const radius = 25;
    const val = ticks / 50;
    let xpos = radius * cos(val) + G.WIDTH / 2;
    let ypos = radius * sin(val) + G.HEIGHT / 2;

    rect(xpos, ypos, 20, 20);

    const radius2 = 50;
    const val2 = -ticks / 30;
    let xpos2 = radius2 * cos(val2) + xpos;
    let ypos2 = radius2 * sin(val2) + ypos;

    rect(xpos2, ypos2, 10, 10);

    const radius3 = 15;
    const val3 = -ticks / 10;
    let xpos3 = radius3 * cos(val3) + xpos2;
    let ypos3 = radius3 * sin(val3) + ypos2;

    rect(xpos3, ypos3, 5, 5); 
};