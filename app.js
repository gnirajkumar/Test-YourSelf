let allData = {};
let questions = [];
let current = 0, score = 0;
let timerInterval, timeLeft = 0;
let timerStarted = false; // ✅ track if timer has started

async function loadData(){
  let res = await fetch("questions.json");
  allData = await res.json();
  populateSelectors();
}

function populateSelectors(){
  let classSel = document.getElementById("classSelect");
  let subjSel = document.getElementById("subjectSelect");
  let topicSel = document.getElementById("topicSelect");

  for(let cls in allData){
    let opt = document.createElement("option");
    opt.value = cls; opt.textContent = cls;
    classSel.appendChild(opt);
  }

  classSel.onchange = ()=>{
    subjSel.innerHTML="";
    for(let subj in allData[classSel.value]){
      let opt = document.createElement("option");
      opt.value=subj; opt.textContent=subj;
      subjSel.appendChild(opt);
    }
    subjSel.onchange();
  };

  subjSel.onchange = ()=>{
    topicSel.innerHTML="";
    for(let topic in allData[classSel.value][subjSel.value]){
      let opt = document.createElement("option");
      opt.value=topic; opt.textContent=topic;
      topicSel.appendChild(opt);
    }
  };
  classSel.onchange();
}

document.getElementById("startBtn").onclick = ()=>{
  let cls = classSelect.value;
  let subj = subjectSelect.value;
  let topic = topicSelect.value;
  questions = allData[cls][subj][topic];
  current=0; score=0;
  timerStarted = false; // reset
  document.querySelector(".picker").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  loadQ();
};

function loadQ(){
  let q = questions[current];
  document.getElementById("qText").textContent = q.questionText;
  let qImg = document.getElementById("qImg");
  qImg.src = q.questionImage || "";
  qImg.style.display = q.questionImage ? "block":"none";

  let opts = document.getElementById("options");
  opts.innerHTML="";
  q.options.forEach((opt,i)=>{
    let div = document.createElement("div");
    div.className="option";
    if(opt.image){
      let img = document.createElement("img");
      img.src = opt.image; img.style.maxWidth="80px";
      div.appendChild(img);
    }
    if(opt.text){
      let span = document.createElement("span");
      span.textContent=opt.text;
      div.appendChild(span);
    }
    div.onclick=()=>select(i);
    opts.appendChild(div);
  });

  document.getElementById("explanation").classList.add("hidden");
  document.getElementById("scoreBox").textContent = `Score: ${score}/${questions.length}`;
}

function select(i){
  // ✅ Start timer on first attempt only
  if(!timerStarted){
    timerStarted = true;
    startTimer(questions.length * 30); // 30 sec per question
  }

  let q = questions[current];
  let opts = document.getElementById("options").children;
  if(i===q.correct){ score++; opts[i].classList.add("correct"); }
  else { opts[i].classList.add("wrong"); opts[q.correct].classList.add("correct"); }
  document.getElementById("expText").textContent = q.explanationText || "";
  let expImg=document.getElementById("expImg");
  expImg.src=q.explanationImage||""; expImg.style.display=q.explanationImage?"block":"none";
  document.getElementById("explanation").classList.remove("hidden");
  document.getElementById("scoreBox").textContent = `Score: ${score}/${questions.length}`;
}

document.getElementById("nextBtn").onclick = ()=>{
  if(current < questions.length-1){
    current++;
    loadQ();
  } else {
    endQuiz();
  }
};

document.getElementById("prevBtn").onclick = ()=>{
  if(current > 0){
    current--;
    loadQ();
  }
};

// 🏠 Home button
document.getElementById("homeBtn").onclick = ()=>{
  stopTimer();
  document.getElementById("quiz").classList.add("hidden");
  document.querySelector(".picker").classList.remove("hidden");
};

// ========== ⏳ Timer functions ==========
function startTimer(seconds){
  clearInterval(timerInterval);
  timeLeft = seconds;
  const timerEl = document.getElementById("timer");
  timerEl.style.display = "inline";  // ✅ show timer only now
  updateTimer();
  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimer();
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      endQuiz();
    }
  },1000);
}

function stopTimer(){
  clearInterval(timerInterval);
  const timerEl = document.getElementById("timer");
  timerEl.style.display = "none";    // ✅ hide timer
  timerEl.textContent = "⏳ 00:00";  // reset
}

function updateTimer(){
  let m = String(Math.floor(timeLeft/60)).padStart(2,'0');
  let s = String(timeLeft%60).padStart(2,'0');
  document.getElementById("timer").textContent = `⏳ ${m}:${s}`;
}

function endQuiz(){
  alert(`⏱ Time up or quiz finished! Final Score: ${score}/${questions.length}`);
  document.getElementById("quiz").classList.add("hidden");
  document.querySelector(".picker").classList.remove("hidden");
  stopTimer();  // ✅ stop & hide timer
}

loadData();
