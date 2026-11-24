
const firebaseConfig = {
  apiKey: "AIzaSyCVhOaesTjUZE73KZ9F4K2gbWINfFfbnlA",
  authDomain: "circle-test-1.firebaseapp.com",
  databaseURL: "https://circle-test-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "circle-test-1",
  storageBucket: "circle-test-1.firebasestorage.app",
  messagingSenderId: "1032494057266",
  appId: "1:1032494057266:web:1da7a5f043c73d4c38b92b",
  measurementId: "G-N9HGH31FGC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let particles = [];
let phase = 0;
let phaseStart = 0;
let phaseDuration = 5000;

let lastClicks = null;
let sliderInitialized = false;

const TOTAL = 180;

const colors = [
  [100, 220, 255],
  [170, 255, 130],
  [190, 130, 255],
  [255, 125, 100],
  [255, 215, 100]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < TOTAL; i++) {
    particles.push(new Particle(i));
  }

  phaseStart = millis();

  connectFirebase();
}

function connectFirebase() {

  // 휴대폰 버튼 신호 받기
  db.ref("flower/clicks").on("value", (snap) => {

    const clicks = snap.val() || 0;

    // 처음 연결할 때는 기존 클릭 수를 무시
    if (lastClicks !== null && clicks > lastClicks) {
      nextPhase();
    }

    lastClicks = clicks;
  });

  // 휴대폰 슬라이더 신호 받기
  db.ref("flower/slider").on("value", (snap) => {

    const value = snap.val();

    // 최초 연결 시 기존 값으로 갑자기 바뀌지 않게 함
    if (sliderInitialized && value !== null) {

      const newPhase = constrain(
        floor(value / 20),
        0,
        4
      );

      if (newPhase !== phase) {
        phase = newPhase;
        phaseStart = millis();
      }
    }

    sliderInitialized = true;
  });
}

function draw() {

  background(235, 30, 5, 22);

  let elapsed = millis() - phaseStart;

  let progress = constrain(
    elapsed / phaseDuration,
    0,
    1
  );

  let col = colors[phase];

  // 중앙의 빛
  noStroke();

  fill(col[0], 50, 40, 12);

  circle(
    width / 2,
    height / 2,
    200 + sin(frameCount * 0.02) * 20
  );

  // 입자 업데이트
  for (let p of particles) {
    p.update();
  }

  // 3단계: 입자 사이 연결
  if (phase === 2) {
    drawConnections();
  }

  for (let p of particles) {
    p.display(col);
  }

  drawInterface(progress);
}

class Particle {

  constructor(i) {
    this.i = i;
    this.angle = (TWO_PI * i) / TOTAL;
    this.seed = random(1000);
    this.size = random(2, 5);

    this.pos = createVector(
      width / 2,
      height / 2
    );

    this.vel = createVector(0, 0);
    this.offset = random(TWO_PI);
  }

  update() {

    let t = frameCount * 0.012;

    let cx = width / 2;
    let cy = height / 2;

    let a = this.angle + t * 0.2;

    let r = 0;
    let x, y;

    // 01. 탄생
    if (phase === 0) {

      r = 15 + noise(this.seed, t) * 35;

      x = cx + cos(a) * r;
      y = cy + sin(a) * r;
    }

    // 02. 성장
    else if (phase === 1) {

      r = 40 +
        (this.i / TOTAL) *
        min(width, height) * 0.38;

      r += sin(t * 2 + this.offset) * 18;

      x = cx + cos(a * 2) * r;
      y = cy + sin(a * 2) * r;
    }

    // 03. 연결
    else if (phase === 2) {

      let wave = sin(a * 8 + t * 2);

      r = 130 +
        wave * 65 +
        noise(this.seed, t) * 30;

      x = cx + cos(a) * r;
      y = cy + sin(a) * r;
    }

    // 04. 붕괴
    else if (phase === 3) {

      let scatter =
        100 +
        noise(this.seed, t * 0.7) *
        min(width, height) * 0.55;

      r = scatter *
        (0.5 + sin(t + this.seed) * 0.5);

      x = cx + cos(a + this.offset) * r;
      y = cy + sin(a + this.offset) * r;
    }

    // 05. 재생
    else {

      let k = 1 - constrain(
        (millis() - phaseStart) / phaseDuration,
        0,
        1
      );

      r = (25 + noise(this.seed, t) * 150) * k;

      x = cx + cos(a * 2) * r;
      y = cy + sin(a * 2) * r;
    }

    // 마우스의 영향
    let target = createVector(x, y);
    let d = dist(x, y, mouseX, mouseY);

    if (d < 100 && mouseX > 0 && mouseY > 0) {

      let force = p5.Vector.sub(
        target,
        createVector(mouseX, mouseY)
      );

      force.setMag((100 - d) * 0.12);
      target.add(force);
    }

    this.pos.lerp(target, 0.045);

    this.vel.mult(0.92);
    this.pos.add(this.vel);
  }

  display(col) {

    let pulse =
      1 + sin(frameCount * 0.05 + this.offset) * 0.3;

    let s = this.size * pulse;

    noStroke();

    // 빛 번짐
    fill(col[0], 65, 100, 12);

    circle(
      this.pos.x,
      this.pos.y,
      s * 5
    );

    // 입자 본체
    fill(col[0], 45, 100, 90);

    circle(
      this.pos.x,
      this.pos.y,
      s
    );
  }
}

// 원 사이의 연결선
function drawConnections() {

  for (let i = 0; i < particles.length; i++) {

    for (let j = i + 1; j < particles.length; j++) {

      let a = particles[i].pos;
      let b = particles[j].pos;

      let d = dist(a.x, a.y, b.x, b.y);

      if (d < 65) {

        stroke(
          270,
          50,
          100,
          map(d, 0, 65, 35, 0)
        );

        strokeWeight(0.7);

        line(a.x, a.y, b.x, b.y);
      }
    }
  }
}

// 화면 인터페이스
function drawInterface(progress) {

  let names = [
    "01 / ORIGIN",
    "02 / GROWTH",
    "03 / CONNECTION",
    "04 / COLLAPSE",
    "05 / REBIRTH"
  ];

  push();

  colorMode(RGB);
  textAlign(CENTER);
  noStroke();

  fill(255, 210);
  textSize(13);
  textStyle(BOLD);

  text(
    "C I R C L E",
    width / 2,
    45
  );

  fill(255, 120);
  textSize(10);

  text(
    names[phase],
    width / 2,
    68
  );

  // 진행 바
  let barW = 150;

  fill(255, 35);

  rect(
    width / 2 - barW / 2,
    height - 48,
    barW,
    2
  );

  fill(255, 190);

  rect(
    width / 2 - barW / 2,
    height - 48,
    barW * progress,
    2
  );

  fill(255, 100);
  textSize(9);

  text(
    "CONTROLLED BY MOBILE",
    width / 2,
    height - 25
  );

  pop();
}

// 전시장 화면에서도 직접 테스트 가능
function mousePressed() {
  nextPhase();
}

function keyPressed() {
  if (key === ' ') {
    nextPhase();
  }
}

// 다음 단계로 이동
function nextPhase() {

  phase = (phase + 1) % 5;
  phaseStart = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
