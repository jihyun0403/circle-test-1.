
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

// 버튼 위치
let buttonX;
let buttonY;
let buttonRadius;
let buttonH;

// 슬라이더 위치
let sliderStartX;
let sliderEndX;
let sliderY;
let handleX;
let handleRadius;

let currentSliderValue = 0;

function setup() {

  createCanvas(windowWidth, windowHeight);

  init();

}

function init() {

  buttonX = width * 0.5;
  buttonY = height * 0.5 - 100;

  buttonRadius = 50;
  buttonH = 10;

  // 작은 휴대폰 화면에서도 슬라이더가 잘리지 않도록 설정
  let sliderWidth = min(width * 0.7, 300);

  sliderStartX = width * 0.5 - sliderWidth / 2;
  sliderEndX = width * 0.5 + sliderWidth / 2;

  sliderY = height * 0.5 + 100;

  handleRadius = 20;

  handleX = map(
    currentSliderValue,
    0,
    100,
    sliderStartX,
    sliderEndX
  );
}

function draw() {

  background(242, 139, 5);

  // 제목
  push();

  fill(255);
  noStroke();

  textAlign(CENTER);
  textStyle(BOLD);

  textSize(25);
  text("C I R C L E", width / 2, 65);

  textStyle(NORMAL);
  textSize(13);

  text(
    "MOBILE CONTROL",
    width / 2,
    90
  );

  pop();

  button();
  slider();

  // 슬라이더 단계 표시
  push();

  fill(255);
  noStroke();

  textAlign(CENTER);
  textSize(14);

  let stage = constrain(
    floor(currentSliderValue / 20),
    0,
    4
  );

  let names = [
    "01 / ORIGIN",
    "02 / GROWTH",
    "03 / CONNECTION",
    "04 / COLLAPSE",
    "05 / REBIRTH"
  ];

  text(
    names[stage],
    width / 2,
    sliderY + 55
  );

  textSize(11);

  text(
    "TAP BUTTON OR MOVE SLIDER",
    width / 2,
    height - 40
  );

  pop();
}

// 버튼 터치
function mousePressed() {

  // 동그란 버튼을 눌렀는지 확인
  if (
    dist(
      mouseX,
      mouseY,
      buttonX,
      buttonY - buttonH
    ) < buttonRadius
  ) {

    sendGrow();

  }

  // 슬라이더를 눌렀는지 확인
  if (
    mouseX > sliderStartX - handleRadius &&
    mouseX < sliderEndX + handleRadius &&
    mouseY > sliderY - handleRadius &&
    mouseY < sliderY + handleRadius
  ) {

    updateSlider(mouseX);

  }

  return false;
}

// 슬라이더 드래그
function mouseDragged() {

  if (
    mouseY > sliderY - handleRadius * 2 &&
    mouseY < sliderY + handleRadius * 2
  ) {

    updateSlider(mouseX);

  }

  return false;
}

// 슬라이더 값 변경
function updateSlider(x) {

  handleX = constrain(
    x,
    sliderStartX,
    sliderEndX
  );

  currentSliderValue = round(
    map(
      handleX,
      sliderStartX,
      sliderEndX,
      0,
      100
    )
  );

  sendSlider();
}

// 버튼 디자인
function button() {

  let up = 10;

  if (
    dist(
      mouseX,
      mouseY,
      buttonX,
      buttonY - buttonH
    ) < buttonRadius
  ) {

    up = 7;

    if (mouseIsPressed) {
      up = 2;
    }
  }

  buttonH = lerp(buttonH, up, 0.5);

  noStroke();

  fill(140);

  ellipse(
    buttonX,
    buttonY,
    buttonRadius * 2,
    buttonRadius * 2
  );

  fill(217);

  ellipse(
    buttonX,
    buttonY - buttonH,
    buttonRadius * 2,
    buttonRadius * 2
  );

  fill(255);

  ellipse(
    buttonX,
    buttonY - buttonH,
    buttonRadius * 2 - 15,
    buttonRadius * 2 - 15
  );
}

// 슬라이더 디자인
function slider() {

  let radius = 20;

  if (
    dist(
      mouseX,
      mouseY,
      handleX,
      sliderY
    ) < handleRadius
  ) {

    radius = 22;

    if (mouseIsPressed) {
      radius = 25;
    }
  }

  handleRadius = lerp(
    handleRadius,
    radius,
    0.5
  );

  stroke(255);
  strokeWeight(10);

  line(
    sliderStartX,
    sliderY,
    sliderEndX,
    sliderY
  );

  noStroke();

  fill(255, 255, 255, 70);

  ellipse(
    handleX,
    sliderY,
    handleRadius * 2 + 8,
    handleRadius * 2 + 8
  );

  fill(255);

  ellipse(
    handleX,
    sliderY,
    handleRadius * 2,
    handleRadius * 2
  );
}

// Firebase: 버튼 신호 보내기
function sendGrow() {

  db.ref("flower/clicks").set(
    firebase.database.ServerValue.increment(1)
  );

}

// Firebase: 슬라이더 값 보내기
function sendSlider() {

  db.ref("flower/slider").set(
    currentSliderValue
  );

}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  init();

}
