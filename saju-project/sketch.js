
// ============================================================
// 오늘의 사주 뽑기 🔮
// ============================================================

const W = 640, H = 600;
let currentScreen = "apikey"; // apikey | input | loading | result | game

let doms = [];
let fortuneData = null;
let userName = "";
let birthYear = "", birthMonth = "", birthDay = "", birthHour = "";

// 배경 별
let bgStars = [];

// 파티클
let particles = [];

// 카드 게임
let cardItems = ["", "", ""];
let cardProgress = [0, 0, 0];
let cardFlipping = [false, false, false];
let cardDone = [false, false, false];
let gameRevealed = false;

// 로딩 각도
let loadingAngle = 0;

// ============================================================
function clearDoms() {
  for (let d of doms) { try { d.remove(); } catch(e){} }
  doms = [];
}
function reg(el) { doms.push(el); return el; }

// ============================================================
function setup() {
  createCanvas(W, H);
  textFont("sans-serif");
  for (let i = 0; i < 110; i++) {
    bgStars.push({
      x: random(W), y: random(H),
      sz: random(0.5, 2.5),
      sp: random(0.01, 0.04),
      off: random(TWO_PI)
    });
  }
  if (typeof apiKey === "undefined" || apiKey === "" || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    apiKey = "";
  }
  if (!apiKey) { currentScreen = "apikey"; showApiKeyScreen(); }
  else         { currentScreen = "input";  showInputScreen(); }
}

// ============================================================
function drawBg() {
  background(8, 4, 20);
  noStroke();
  for (let s of bgStars) {
    let b = 130 + sin(frameCount * s.sp + s.off) * 90;
    fill(255, 255, 200, b);
    ellipse(s.x, s.y, s.sz);
  }
}

function spawnParticles(x, y) {
  for (let i = 0; i < 24; i++) {
    particles.push({
      x, y,
      vx: random(-3, 3), vy: random(-5, -1),
      life: 1.0, size: random(5, 12),
      r: random(200,255), g: random(180,220), b: random(50,100)
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.022;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    noStroke();
    fill(p.r, p.g, p.b, p.life * 255);
    ellipse(p.x, p.y, p.size * p.life);
  }
}

// ============================================================
function draw() {
  drawBg();
  if      (currentScreen === "apikey")  drawApiKeyScreen();
  else if (currentScreen === "input")   drawInputScreen();
  else if (currentScreen === "loading") drawLoadingScreen();
  else if (currentScreen === "result")  drawResultScreen();
  else if (currentScreen === "game")    drawGameScreen();
  updateParticles();
}

// ============================================================
// APIKEY SCREEN
function showApiKeyScreen() {
  clearDoms();
  let inp = reg(createInput(""));
  inp.attribute("placeholder", "Gemini API Key (AIza...) 를 입력하세요");
  inp.position(70, 330); inp.size(410, 44);
  styleInp(inp, "#7d3c98");

  let btn = reg(createButton("🔮 운세 보러가기"));
  btn.position(490, 330); btn.size(140, 46);
  styleBtn(btn, "#7d3c98");
  btn.mousePressed(() => {
    let v = inp.value().trim();
    if (!v) return;
    apiKey = v;
    clearDoms(); currentScreen = "input"; showInputScreen();
  });
}

function drawApiKeyScreen() {
  noStroke(); textAlign(CENTER, CENTER);
  let pulse = sin(frameCount * 0.045) * 12;

  // 글로우 원
  for (let r = 4; r >= 1; r--) {
    noFill();
    stroke(155, 89, 182, 20 * r);
    strokeWeight(r * 3);
    ellipse(W/2, 195, 180 + pulse + r*8, 180 + pulse + r*8);
  }
  noStroke();

  textSize(62); text("🔮", W/2, 190);

  fill(255, 210, 80);
  textSize(30); textStyle(BOLD);
  text("오늘의 사주 뽑기", W/2, 270);
  textStyle(NORMAL);

  fill(210, 185, 240);
  textSize(13);
  text("이름 · 생년월일 · 태어난 시각을 입력하면", W/2, 300);
  text("Gemini가 오늘의 운세와 행운 아이템을 뽑아드려요", W/2, 318);

  fill(160, 130, 200); textSize(12);
  text("시작하려면 Gemini API Key를 아래에 입력하세요", W/2, 395);
}

// ============================================================
// INPUT SCREEN
function showInputScreen() {
  clearDoms();

  let nameInp = reg(createInput(""));
  nameInp.attribute("placeholder", "예) 홍길동");
  nameInp.position(210, 190); nameInp.size(230, 40);
  styleInp(nameInp);

  let yInp = reg(createInput(""));
  yInp.attribute("placeholder", "1998");
  yInp.position(90, 260); yInp.size(110, 40);
  styleInp(yInp);

  let mInp = reg(createInput(""));
  mInp.attribute("placeholder", "01");
  mInp.position(230, 260); mInp.size(85, 40);
  styleInp(mInp);

  let dInp = reg(createInput(""));
  dInp.attribute("placeholder", "01");
  dInp.position(345, 260); dInp.size(85, 40);
  styleInp(dInp);

  let hInp = reg(createInput(""));
  hInp.attribute("placeholder", "0~23 숫자만");
  hInp.position(210, 330); hInp.size(230, 40);
  styleInp(hInp);

  let errMsg = reg(createP(""));
  errMsg.position(70, 375); errMsg.style("color", "#ff6b6b");
  errMsg.style("font-size", "13px"); errMsg.style("margin", "0");

  let btn = reg(createButton("✨ 운세 확인하기"));
  btn.position(210, 400); btn.size(230, 50);
  styleBtn(btn, "#e67e22");
  btn.style("font-size", "16px");
  btn.mousePressed(() => {
    let n = nameInp.value().trim();
    let y = yInp.value().trim();
    let m = mInp.value().trim();
    let d = dInp.value().trim();
    let h = hInp.value().trim();
    if (!n || !y || !m || !d || !h) {
      errMsg.html("⚠️ 모든 항목을 입력해주세요!");
      return;
    }
    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
      errMsg.html("⚠️ 생년월일과 시각은 숫자로 입력해주세요!");
      return;
    }
    userName = n; birthYear = y; birthMonth = m; birthDay = d; birthHour = h;
    clearDoms(); currentScreen = "loading"; fetchFortune();
  });
}

function drawInputScreen() {
  noStroke(); textAlign(CENTER, CENTER);

  // 헤더
  fill(20, 10, 50); rect(0, 0, W, 68);
  fill(255, 210, 80); textSize(20); textStyle(BOLD);
  text("🌟 나의 정보 입력", W/2, 34); textStyle(NORMAL);

  fill(200, 175, 235); textSize(12);
  text("정확한 정보를 입력할수록 운세가 정확해집니다", W/2, 90);

  // 라벨
  textAlign(LEFT, CENTER);
  fill(255, 210, 80); textSize(14);
  text("이름", 110, 210);
  text("생년월일", 100, 280);
  fill(180, 150, 220); textSize(12);
  text("년", 210, 280); text("월", 325, 280); text("일", 440, 280);
  fill(255, 210, 80); textSize(14);
  text("태어난 시각", 100, 350);

  // 구분선
  stroke(70, 40, 110); strokeWeight(1);
  line(60, 150, W-60, 150); noStroke();

  // 카드 박스
  noFill(); stroke(80, 50, 130, 120); strokeWeight(1.5);
  rect(60, 160, W-120, 290, 16); noStroke();
}

// ============================================================
// LOADING SCREEN
function drawLoadingScreen() {
  loadingAngle += 0.045;
  textAlign(CENTER, CENTER); noStroke();

  push();
  translate(W/2, H/2 - 70);
  for (let i = 0; i < 3; i++) {
    rotate(loadingAngle * (1 + i * 0.4));
    let a = 120 + sin(frameCount * 0.08 + i * 1.2) * 80;
    stroke(200 - i*40, 100 + i*50, 255, a);
    strokeWeight(2.5 - i*0.5);
    noFill();
    ellipse(0, 0, 130 - i*28, 130 - i*28);
  }
  noStroke();
  textSize(44); text("⭐", 0, 0);
  pop();

  fill(255, 210, 80); textSize(20); textStyle(BOLD);
  text("운세를 읽는 중...", W/2, H/2 + 55); textStyle(NORMAL);
  fill(190, 160, 230); textSize(13);
  text("Gemini가 당신의 사주를 분석하고 있어요 🔮", W/2, H/2 + 85);
  fill(150, 120, 190); textSize(11);
  text("잠시만 기다려주세요", W/2, H/2 + 108);
}

// ============================================================
// FETCH FORTUNE
function fetchFortune() {
  let today = new Date();
  let todayStr = today.getFullYear() + "년 " + (today.getMonth()+1) + "월 " + today.getDate() + "일";

  let prompt = `사용자 정보:
- 이름: ${userName}
- 생년월일: ${birthYear}년 ${birthMonth}월 ${birthDay}일
- 태어난 시각: ${birthHour}시
- 오늘 날짜: ${todayStr}

위 정보를 기반으로 오늘의 운세를 사주 철학 스타일로 재미있고 풍부하게 분석해주세요.
MZ세대가 좋아하는 트렌디하고 공감 가는 말투로 작성해주세요.
반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 절대 포함하지 마세요:
{
  "총운": "2~3문장으로 오늘의 전반적인 운세",
  "연애운": "2~3문장으로 오늘의 연애 운세",
  "재물운": "2~3문장으로 오늘의 재물 운세",
  "건강운": "2~3문장으로 오늘의 건강 운세",
  "한줄운세": "오늘을 한 문장으로 표현하는 임팩트 있는 문장",
  "행운아이템": ["아이템명: 이유 한 문장", "아이템명: 이유 한 문장", "아이템명: 이유 한 문장"],
  "행운색": "색상 이름",
  "행운숫자": 숫자
}`;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
  })
  .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then(data => {
    let raw = data.candidates[0].content.parts[0].text;
    let jsonStr = raw.replace(/```json/g,"").replace(/```/g,"").trim();
    fortuneData = JSON.parse(jsonStr);
    cardItems = fortuneData["행운아이템"] || ["행운 아이템 1","행운 아이템 2","행운 아이템 3"];
    cardProgress = [0,0,0]; cardFlipping = [false,false,false];
    cardDone = [false,false,false]; gameRevealed = false;
    currentScreen = "result";
  })
  .catch(err => {
    console.error(err);
    currentScreen = "input"; showInputScreen();
  });
}

// ============================================================
// RESULT SCREEN
function drawResultScreen() {
  if (!fortuneData) return;
  textAlign(CENTER, CENTER); noStroke();

  // 헤더
  fill(18, 8, 45); rect(0, 0, W, 68);
  fill(255, 210, 80); textSize(18); textStyle(BOLD);
  text("✨ " + userName + "님의 오늘 운세", W/2, 34); textStyle(NORMAL);

  // 한줄 운세
  let glow = sin(frameCount * 0.05);
  fill(255, 130 + glow*20, 80);
  textSize(13); textStyle(ITALIC);
  text('"' + (fortuneData["한줄운세"] || "") + '"', W/2, 88); textStyle(NORMAL);

  // 행운색 & 행운숫자
  fill(160, 210, 255); textSize(12);
  text("🎨 행운색: " + fortuneData["행운색"] + "   🔢 행운숫자: " + fortuneData["행운숫자"], W/2, 112);

  // 4개 카드
  let cats = ["총운","연애운","재물운","건강운"];
  let emojis = ["🌟","💕","💰","💪"];
  let cols = [[255,210,80],[255,100,150],[100,220,120],[100,180,255]];
  let cW = 290, cH = 110;
  let pos = [[18,128],[332,128],[18,248],[332,248]];

  for (let i = 0; i < 4; i++) {
    let [cx,cy] = pos[i]; let cl = cols[i];
    // 카드 쉐도우
    fill(cl[0],cl[1],cl[2],30);
    rect(cx+4, cy+4, cW, cH, 14);
    // 카드 본체
    fill(18, 8, 46, 230);
    stroke(cl[0],cl[1],cl[2],120); strokeWeight(1.5);
    rect(cx, cy, cW, cH, 14); noStroke();
    // 좌측 컬러 바
    fill(cl[0],cl[1],cl[2]);
    rect(cx, cy, 5, cH, 14, 0, 0, 14);
    // 타이틀
    textAlign(LEFT, TOP);
    fill(cl[0],cl[1],cl[2]); textSize(13); textStyle(BOLD);
    text(emojis[i] + " " + cats[i], cx+16, cy+12); textStyle(NORMAL);
    // 내용
    fill(220, 210, 240); textSize(10.5);
    drawWrapL(fortuneData[cats[i]] || "", cx+16, cy+34, cW-28, 15);
  }

  // 미니게임 버튼
  let btnY = 374;
  let bPulse = sin(frameCount * 0.07) * 4;
  fill(110, 40, 200);
  stroke(255, 210, 80, 130 + bPulse*10); strokeWeight(2);
  rect(W/2-155, btnY, 310, 54, 27); noStroke();
  fill(255,255,255); textAlign(CENTER, CENTER);
  textSize(15); textStyle(BOLD);
  text("🎴 행운 아이템 뽑기 미니게임!", W/2, btnY+27); textStyle(NORMAL);
  fill(180,150,220); textSize(11);
  text("카드 3장 중 하나를 선택해 행운 아이템을 뽑아보세요 ✨", W/2, btnY+55);
}

// ============================================================
// GAME SCREEN
function drawGameScreen() {
  textAlign(CENTER, CENTER); noStroke();

  // 헤더
  fill(18,8,45); rect(0,0,W,68);
  fill(255,210,80); textSize(20); textStyle(BOLD);
  text("🎴 행운 아이템 뽑기", W/2, 34); textStyle(NORMAL);

  if (!gameRevealed) {
    fill(210,185,245); textSize(13);
    text("카드 하나를 눌러 오늘의 행운 아이템을 뽑아보세요!", W/2, 90);
  } else {
    fill(255,210,80); textSize(13);
    text("✨ 오늘의 행운 아이템이 결정되었습니다!", W/2, 90);
  }

  // 카드 3장
  let cW = 158, cH = 220, cY = 140;
  let cXs = [W/2 - 195, W/2 - 79, W/2 + 37];

  for (let i = 0; i < 3; i++) {
    let cx = cXs[i];
    // 플립 진행
    if (cardFlipping[i]) {
      cardProgress[i] += 0.07;
      if (cardProgress[i] >= 1) { cardProgress[i] = 1; cardFlipping[i] = false; cardDone[i] = true; }
    }

    let prog = cardProgress[i];
    let isHover = !gameRevealed && mouseX>cx && mouseX<cx+cW && mouseY>cY && mouseY<cY+cH;

    push();
    translate(cx + cW/2, cY + cH/2);

    if (prog < 0.5) {
      // 뒷면 축소
      let sx = 1 - prog * 2;
      scale(sx, 1);
      drawCardBack(cW, cH, isHover);
    } else {
      // 앞면 확대
      let sx = (prog - 0.5) * 2;
      scale(sx, 1);
      drawCardFront(cW, cH, i);
    }
    pop();
  }

  // 완료 후 안내
  if (gameRevealed && cardDone[0] && cardDone[1] && cardDone[2]) {
    fill(200,175,240); textSize(12);
    text("행운 아이템을 꼭 챙겨보세요! 오늘 하루도 좋은 일만 가득 🌟", W/2, 400);

    // 돌아가기 버튼
    fill(40,25,80);
    stroke(180,120,255,120); strokeWeight(1.5);
    rect(W/2-110, 422, 220, 44, 22); noStroke();
    fill(220,200,255); textSize(13);
    text("← 운세 다시 보기", W/2, 444);

    // 다시하기 버튼
    fill(20,10,50);
    stroke(255,150,80,120); strokeWeight(1.5);
    rect(W/2-110, 476, 220, 44, 22); noStroke();
    fill(255,200,150); textSize(13);
    text("🔄 처음부터 다시하기", W/2, 498);
  }
}

function drawCardBack(cW, cH, isHover) {
  // 글로우 효과
  if (isHover) {
    for (let r = 3; r >= 1; r--) {
      fill(120, 50, 220, 25*r);
      noStroke();
      rect(-cW/2-r*3, -cH/2-r*3, cW+r*6, cH+r*6, 16);
    }
  }
  fill(isHover ? color(75,25,160) : color(45,15,100));
  stroke(150,100,255, isHover ? 200 : 100); strokeWeight(2);
  rect(-cW/2, -cH/2, cW, cH, 14); noStroke();
  // 카드 패턴
  stroke(100,60,180,40); strokeWeight(1);
  for (let y=-cH/2+15; y<cH/2-10; y+=18) line(-cW/2+10, y, cW/2-10, y);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(44); text("🔮", 0, -20);
  fill(isHover ? color(220,190,255) : color(170,130,220));
  textSize(11);
  text(isHover ? "클릭!" : "카드 뽑기", 0, 48);
  if (isHover) { fill(255,210,80); textSize(9); text("✨ tap ✨", 0, 64); }
}

function drawCardFront(cW, cH, idx) {
  // 골드 카드
  fill(255, 248, 215);
  stroke(255, 200, 50); strokeWeight(2.5);
  rect(-cW/2, -cH/2, cW, cH, 14); noStroke();
  // 장식 테두리
  stroke(255,200,50,80); strokeWeight(1);
  rect(-cW/2+6, -cH/2+6, cW-12, cH-12, 10); noStroke();

  textAlign(CENTER, TOP);
  textSize(38); text("✨", 0, -cH/2+18);

  fill(80, 40, 10); textSize(11); textStyle(BOLD);
  text("오늘의 행운 아이템", 0, -cH/2+65); textStyle(NORMAL);

  // 구분선
  stroke(200, 160, 50, 150); strokeWeight(1);
  line(-cW/2+20, -cH/2+83, cW/2-20, -cH/2+83); noStroke();

  fill(90, 50, 15); textSize(10);
  drawWrapC(cardItems[idx] || "", 0, -cH/2+92, cW-28, 14);
}

// ============================================================
// MOUSE
function mousePressed() {
  if (currentScreen === "result") {
    let btnY = 374;
    if (mouseX > W/2-155 && mouseX < W/2+155 && mouseY > btnY && mouseY < btnY+54) {
      currentScreen = "game";
    }
  }

  if (currentScreen === "game") {
    let cW=158, cH=220, cY=140;
    let cXs = [W/2-195, W/2-79, W/2+37];

    if (!gameRevealed) {
      for (let i=0; i<3; i++) {
        if (mouseX>cXs[i] && mouseX<cXs[i]+cW && mouseY>cY && mouseY<cY+cH) {
          cardFlipping[i] = true;
          spawnParticles(cXs[i]+cW/2, cY+cH/2);
          gameRevealed = true;
          let picked = i;
          setTimeout(() => {
            for (let j=0; j<3; j++) { if (j!==picked) cardFlipping[j]=true; }
          }, 350);
          break;
        }
      }
    }

    // 돌아가기
    if (gameRevealed && mouseX>W/2-110 && mouseX<W/2+110 && mouseY>422 && mouseY<466) {
      currentScreen = "result";
    }
    // 다시하기
    if (gameRevealed && mouseX>W/2-110 && mouseX<W/2+110 && mouseY>476 && mouseY<520) {
      fortuneData = null; userName = "";
      currentScreen = "input"; showInputScreen();
    }
  }
}

// ============================================================
// 텍스트 줄바꿈 헬퍼
function drawWrapL(str, x, y, maxW, lh) {
  if (!str) return;
  let words = str.split(" "), line = "", cy = y;
  textAlign(LEFT, TOP);
  for (let w of words) {
    let test = line + (line?" ":"") + w;
    if (textWidth(test) > maxW && line) { text(line, x, cy); line = w; cy += lh; }
    else line = test;
  }
  if (line) text(line, x, cy);
}

function drawWrapC(str, x, y, maxW, lh) {
  if (!str) return;
  let words = str.split(" "), lines = [], line = "";
  for (let w of words) {
    let test = line + (line?" ":"") + w;
    if (textWidth(test) > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  textAlign(CENTER, TOP);
  for (let i=0; i<lines.length; i++) text(lines[i], x, y + i*lh);
}

// ============================================================
// 스타일 헬퍼
function styleInp(el, borderColor) {
  el.style("background","rgba(15,8,40,0.92)");
  el.style("color","#e8d5ff");
  el.style("border","1.5px solid " + (borderColor||"#6c3483"));
  el.style("border-radius","9px");
  el.style("padding","0 12px");
  el.style("font-size","14px");
  el.style("outline","none");
  el.style("box-sizing","border-box");
}

function styleBtn(el, bg) {
  el.style("background", bg||"#7d3c98");
  el.style("color","white");
  el.style("border","none");
  el.style("border-radius","10px");
  el.style("font-size","15px");
  el.style("font-weight","bold");
  el.style("cursor","pointer");
  el.style("box-sizing","border-box");
}
