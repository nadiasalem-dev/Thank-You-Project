let grassNum = 25;
let heights = [];
let thankYouFile;
let currentRecipient;
let code;
let audio;
let accessCodeValid = true;
let isPlaying = false;
let characters;

let mascotState = "bottomUp";

let rufflesY, compieY, rosieY, zoeyY;
let rufflesX, compieX, rosieX, zoeyX;

let topY;
let bottomFinalY;
let topFinalY;

let mascotW;
let mascotH;
let run = false;

let bow;
let giftX, giftY, giftW;
let currentGiftX;

let numberOfClicks = 0;
let clickMeY;

function preload() {
  thankYouFile = loadJSON("thankYouData.json");
  characters = loadImage("images/characterSpriteSheet.png");
  bow = loadImage("images/bow.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupLayout();
let params = new URLSearchParams(window.location.search);
code = params.get("accessCode");
  currentRecipient = thankYouFile.recipients.find(
    (recipient) => recipient.accessCode === code
  );

if (!currentRecipient) {
  currentRecipient = {
    name: "Everyone who has celebrated with me!",
    color: "red",
    audio: "everyone.mp3"
  };
}

  audio = loadSound("audio/" + currentRecipient.audio);
  audio.onended(function () {
    isPlaying = false;
  });
}
setTimeout(() => {
  resizeCanvas(windowWidth, windowHeight);
  setupLayout();
}, 250);
function setupLayout() {
  heights = [];

  for (let i = 0; i < grassNum * 2 + 1; i++) {
    heights.push(random(height * 0.38, height * 0.48));
  }

  mascotW = min(width * 0.3, height * 0.3);
  mascotH = mascotW * 1.15;

  rufflesX = width * 0.05;
  compieX = width * 0.69;
  rosieX = width * 0.05;
  zoeyX = width * 0.69;

  topY = height * 0.28;
  topFinalY = height * 0.5;
  bottomFinalY = height * 0.7;

  rufflesY = height + mascotH;
  compieY = height + mascotH;
  rosieY = topFinalY;
  zoeyY = topFinalY;

  mascotState = "bottomUp";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupLayout();
}

function draw() {
  background(176, 224, 230);

  drawSun();

  if (run) {
    if (mascotState === "bottomUp") {
      rufflesY -= height * 0.005;
      compieY -= height * 0.005;

      if (rufflesY <= topY && compieY <= topY) {
        mascotState = "bottomDown";
      }

      drawBottomPair();
      drawBottomSign();
    }
  }

  if (mascotState === "topUp") {
    rosieY -= height * 0.005;
    zoeyY -= height * 0.005;

    if (rosieY <= topY && zoeyY <= topY) {
      mascotState = "topDown";
    }

    drawTopPair();
    drawTopSign();
  }

  drawGrass();

  if (!run) {
    giftW = min(width, height) * 0.12;
    giftX = width / 2 - giftW / 2;
    giftY = height * 0.75;

    let shakeGift = 0;

    if (numberOfClicks === 1) {
      shakeGift = 8 * sin(frameCount * 0.35);
    }

    currentGiftX = giftX + shakeGift;

    drawPresentBox(currentGiftX, giftY, giftW);

    let giftMeTravel = giftW * 1.3;
    let clickMeStartY = giftY + giftW * 1.2;
    let clickMeEndY = giftY - giftMeTravel;

    if (clickMeY === undefined || clickMeY < clickMeEndY) {
      clickMeY = clickMeStartY;
    }

    let clickMeAlpha = map(clickMeY, clickMeStartY, clickMeEndY, 255, 0);

    let maxClickFont = giftW * 0.4;
    let minClickFont = giftW * 0.25;

    let clickMeFontSize = map(
      clickMeY,
      clickMeStartY,
      clickMeEndY,
      maxClickFont,
      minClickFont
    );

    let words =
      numberOfClicks > 0
        ? "Click Again to See What's Alive Inside!"
        : "Click Me";

    push();
    fill(0, clickMeAlpha);
    stroke(12, clickMeAlpha);
    textSize(clickMeFontSize);
    textAlign(CENTER, CENTER);
    text(words, giftX + giftW / 2, clickMeY);
    pop();

    clickMeY--;
  } else {
    if (mascotState === "bottomDown") {
      rufflesY += height * 0.005;
      compieY += height * 0.005;

      if (rufflesY >= bottomFinalY && compieY >= bottomFinalY) {
        mascotState = "topUp";
      }
    }

    if (
      mascotState === "bottomDown" ||
      mascotState === "topUp" ||
      mascotState === "topDown" ||
      mascotState === "done"
    ) {
      drawBottomPair();
      drawBottomSign();
    }

    if (mascotState === "topDown") {
      rosieY += height * 0.005;
      zoeyY += height * 0.005;

      if (rosieY >= topFinalY && zoeyY >= topFinalY) {
        mascotState = "done";
      }

      drawTopPair();
      drawTopSign();
    }

    if (mascotState === "done") {
      drawBottomPair();
      drawBottomSign();
      drawTopPair();
      drawTopSign();
    }
  }
}

function mousePressed() {
  handleGiftPress();
}

function touchStarted() {
  handleGiftPress();
  return false;
}

function handleGiftPress() {
  if (run) return false;

  let pressedGift = giftPressed();

  if (pressedGift && numberOfClicks === 0) {
    numberOfClicks = 1;
    userStartAudio();
    return false;
  }

  if (pressedGift && numberOfClicks === 1) {
    run = true;

    if (accessCodeValid && !isPlaying) {
      audio.play();
      isPlaying = true;
    }

    return false;
  }
}

function giftPressed() {
  let testX = currentGiftX || giftX;

  let bowWidth = giftW * 1.8;
  let bowHeight = giftW * 1.8;

  let ribbonW = giftW * 0.2;
  let depth = giftW * 0.3;
  let rise = giftW * 0.5;

  let centerTop = testX + giftW / 2;
  let left = centerTop - ribbonW / 2;
  let right = centerTop + ribbonW / 2;

  let bowX = (left + right) / 2 + depth / 2;
  let bowY = giftY - rise / 2;

  let boxPressed =
    mouseX >= testX &&
    mouseX <= testX + giftW * 1.3 &&
    mouseY >= giftY - giftW * 0.5 &&
    mouseY <= giftY + giftW;

  let bowPressed =
    mouseX >= bowX - bowWidth / 2 &&
    mouseX <= bowX + bowWidth / 2 &&
    mouseY >= bowY - bowHeight / 2 &&
    mouseY <= bowY + bowHeight / 2;

  return boxPressed || bowPressed;
}

function drawGrass() {
  let spread = width / (grassNum * 2);

  push();
  fill(0, 154, 53);
  stroke(255, 230, 80);
  strokeWeight(width * 0.01);

  beginShape();

  for (let i = 0; i < grassNum * 2 + 1; i++) {
    let x = width - spread * i;

    if (i % 2 === 0) {
      vertex(x, height * 0.5);
    } else {
      vertex(x, heights[i]);
    }
  }

  vertex(0, height);
  vertex(width, height);
  endShape(CLOSE);
  pop();
}

function drawSun() {
  let sunX = width * 0.1;
  let sunY = height * 0.1;
  let sunDiameter = min(width, height) * 0.16;
  let sunRadius = sunDiameter / 2;

  push();
  fill(255, 215, 0);
  ellipse(sunX, sunY, sunDiameter);

  stroke(255, 230, 80);
  strokeWeight(min(width, height) * 0.008);

  for (let i = 0; i <= 360; i += 10) {
    let startX = sunX + sunRadius * cos(radians(i));
    let endX = sunX + (sunRadius + sunDiameter * 0.7) * cos(radians(i));
    let startY = sunY + sunRadius * sin(radians(i));
    let endY = sunY + (sunRadius + sunDiameter * 0.7) * sin(radians(i));

    line(startX, startY, endX, endY);
  }

  pop();
}

function drawBottomPair() {
  spriteSheetSeparation(characters, rufflesX, rufflesY, mascotW, mascotH, 4, 3);
  spriteSheetSeparation(characters, compieX, compieY, mascotW, mascotH, 4, 1);
}

function drawTopPair() {
  spriteSheetSeparation(characters, rosieX, rosieY, mascotW, mascotH, 4, 2);
  spriteSheetSeparation(characters, zoeyX, zoeyY, mascotW, mascotH, 4, 0);
}

function drawBottomSign() {
  let signX = rufflesX + mascotW * 0.72;
  let signY = rufflesY + mascotH * 0.08;
  let signW = compieX - signX + mascotW * 0.25;
  let signH = height * 0.09;

  drawSign(signX, signY, signW, signH, currentRecipient.name, true);
}

function drawTopSign() {
  let signX = rosieX + mascotW * 0.72;
  let signY = rosieY + mascotH * 0.08;
  let signW = zoeyX - signX + mascotW * 0.25;
  let signH = height * 0.09;

  drawSign(signX, signY, signW, signH, "Thank You", false);
}

function drawSign(x, y, w, h, words, shrink) {
  push();

  fill(currentRecipient.color);
  stroke(0);
  strokeWeight(min(width, height) * 0.008);
  rect(x, y, w, h);

  textAlign(CENTER, CENTER);
  let size = min(width, height) * 0.04;
  textSize(size);
  textFont(BOLD);

  while (textWidth(currentRecipient.name) >= w - 20 && size > 10 && shrink) {
    size--;
    textSize(size);
  }

  fill(255, 215, 0);
  text(words, x + w / 2, y + h / 2);

  pop();
}

function spriteSheetSeparation(
  spriteSheet,
  dx,
  dy,
  dWidth,
  dHeight,
  frameAmountWidth,
  frameNum
) {
  let frameWidth = spriteSheet.width / frameAmountWidth;
  let frameHeight = spriteSheet.height;
  let xCoordinate = frameNum * frameWidth;

  image(
    spriteSheet,
    dx,
    dy,
    dWidth,
    dHeight,
    xCoordinate,
    0,
    frameWidth,
    frameHeight
  );
}

function drawPresentBox(x, y, boxW) {
  let boxH = boxW;
  let depth = boxW * 0.3;
  let rise = boxW * 0.5;
  let ribbonW = boxW * 0.2;

  fill("yellow");

  rect(x, y, boxW, boxH);

  quad(x, y, x + depth, y - rise, x + boxW + depth, y - rise, x + boxW, y);

  quad(
    x + boxW,
    y,
    x + boxW + depth,
    y - rise,
    x + boxW + depth,
    y + boxH - rise,
    x + boxW,
    y + boxH
  );

  fill("red");

  rect(x + boxW / 2 - ribbonW / 2, y, ribbonW, boxH);

  let centerTop = x + boxW / 2;
  let left = centerTop - ribbonW / 2;
  let right = centerTop + ribbonW / 2;

  quad(left, y, left + depth, y - rise, right + depth, y - rise, right, y);

  let bowX = (left + right) / 2 + depth / 2;
  let bowY = y - rise / 2;

  let bowWidth = boxW * 1.8;
  let bowHeight = boxW * 1.8;

  imageMode(CENTER);
  image(bow, bowX, bowY, bowWidth, bowHeight);
  imageMode(CORNER);
}
