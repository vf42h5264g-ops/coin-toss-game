document.addEventListener("DOMContentLoaded", () => {
  // ========= 画像 =========
  const IMG = {
    HEAD: "img/head.png",
    TAIL: "img/tail.png",
  };

  // 事前ロード（チラつき防止）
  Object.values(IMG).forEach((src) => {
    const im = new Image();
    im.src = src;
  });

  // ========= localStorage keys =========
  const LS = {
    titlePoints: "ct_title_points",
    dailyDate: "ct_daily_date",       // "YYYY-MM-DD"
    chainBest: "ct_chain_best",
  };

  // ========= 称号 =========
  // 30までは LUCK、50で FATE に変化
  const TITLES = [
    { pts: 1,  name: "Lucky Beginner" },
    { pts: 5,  name: "Lucky Hand" },
    { pts: 10, name: "Luck Adept" },
    { pts: 20, name: "Chain of Luck" },
    { pts: 30, name: "Lord of Luck" },
    { pts: 50, name: "Architect of Fate" },
  ];

  // ========= 画面DOM =========
  const startScreen = document.getElementById("startScreen");
  const quickScreen = document.getElementById("quickScreen");
  const dailyScreen = document.getElementById("dailyScreen");
  const chainScreen = document.getElementById("chainScreen");

  const screens = {
    start: startScreen,
    quick: quickScreen,
    daily: dailyScreen,
    chain: chainScreen,
  };

  // Start UI
  const titleNameEl = document.getElementById("titleName");
  const titlePointsEl = document.getElementById("titlePoints");
  const dailyStatusEl = document.getElementById("dailyStatus");

  const btnQuick = document.getElementById("btnQuick");
  const btnDaily = document.getElementById("btnDaily");
  const btnChain = document.getElementById("btnChain");

  // Quick
  const quickCoin = document.getElementById("quickCoin");
  const quickResult = document.getElementById("quickResult");
  const quickTossBtn = document.getElementById("quickTossBtn");

  // Daily
  const dailyCoin = document.getElementById("dailyCoin");
  const dailyMsg = document.getElementById("dailyMsg");
  const dailyPickHead = document.getElementById("dailyPickHead");
  const dailyPickTail = document.getElementById("dailyPickTail");
  const dailyAgainBtn = document.getElementById("dailyAgainBtn");

  // Chain
  const chainCoin = document.getElementById("chainCoin");
  const chainMsg = document.getElementById("chainMsg");
  const chainPickHead = document.getElementById("chainPickHead");
  const chainPickTail = document.getElementById("chainPickTail");
  const chainRestartBtn = document.getElementById("chainRestartBtn");
  const chainStreakEl = document.getElementById("chainStreak");
  const chainBestEl = document.getElementById("chainBest");

  // ========= 状態 =========
  const state = {
    tossing: false,
    titlePoints: readInt(LS.titlePoints, 0),
    chainStreak: 0,
    chainBest: readInt(LS.chainBest, 0),
  };

  // ========= 共通ユーティリティ =========
  function todayStr() {
    // ローカル日付で "YYYY-MM-DD"
    const d = new Date();
    const y = String(d.getFullYear());
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function readInt(key, fallback) {
    const v = window.localStorage.getItem(key);
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function writeInt(key, value) {
    window.localStorage.setItem(key, String(value));
  }

  function pickTitle(points) {
    // 条件を満たす最大の称号
    let current = null;
    for (const t of TITLES) {
      if (points >= t.pts) current = t;
    }
    return current ? current.name : "No Title Yet";
  }

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.add("hidden"));
    screens[name].classList.remove("hidden");
  }

  function randResult() {
    return Math.random() < 0.5 ? "HEAD" : "TAIL";
  }

  function setSpinning(imgEl, spinning) {
    imgEl.classList.toggle("spinning", spinning);
  }

  function setGlowByStreak(imgEl, streak) {
    imgEl.classList.remove("glow1", "glow2", "glow3");
    if (streak >= 10) imgEl.classList.add("glow3");
    else if (streak >= 5) imgEl.classList.add("glow2");
    else if (streak >= 3) imgEl.classList.add("glow1");
  }

  async function tossAnimation(imgEl, durationMs = 1100) {
    setSpinning(imgEl, true);
    await wait(durationMs);
    setSpinning(imgEl, false);
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function refreshStartUI() {
    titlePointsEl.textContent = String(state.titlePoints);
    titleNameEl.textContent = pickTitle(state.titlePoints);

    // Daily status
    const last = window.localStorage.getItem(LS.dailyDate);
    dailyStatusEl.textContent = (last === todayStr()) ? "Completed" : "Available";
  }

  function addTitlePoint(n) {
    state.titlePoints += n;
    writeInt(LS.titlePoints, state.titlePoints);
    refreshStartUI();
  }

  // ========= 戻るボタン（共通） =========
  document.querySelectorAll("[data-go='start']").forEach((btn) => {
    btn.addEventListener("click", () => {
      refreshStartUI();
      showScreen("start");
    });
  });

  // ========= START -> 各モード =========
  btnQuick.addEventListener("click", () => {
    resetQuick();
    showScreen("quick");
  });

  btnDaily.addEventListener("click", () => {
    enterDaily();
    showScreen("daily");
  });

  btnChain.addEventListener("click", () => {
    enterChain();
    showScreen("chain");
  });

  // ========= QUICK TOSS =========
  function resetQuick() {
    quickCoin.src = IMG.HEAD;
    quickResult.textContent = "Tap to toss";
    quickTossBtn.disabled = false;
  }

  quickTossBtn.addEventListener("click", async () => {
    if (state.tossing) return;
    state.tossing = true;
    quickTossBtn.disabled = true;
    quickResult.textContent = "Tossing...";

    const r = randResult();
    await tossAnimation(quickCoin, 1100);
    quickCoin.src = IMG[r];

    quickResult.textContent = `Result: ${r}`;
    quickTossBtn.disabled = false;
    state.tossing = false;
  });

  // ========= DAILY FLIP =========
  function enterDaily() {
    dailyCoin.src = IMG.HEAD;
    dailyAgainBtn.classList.add("hidden");
    dailyPickHead.disabled = false;
    dailyPickTail.disabled = false;

    const last = window.localStorage.getItem(LS.dailyDate);
    if (last === todayStr()) {
      dailyMsg.textContent = "Already completed today. Come back tomorrow!";
      dailyPickHead.disabled = true;
      dailyPickTail.disabled = true;
      dailyAgainBtn.classList.remove("hidden");
      return;
    }

    dailyMsg.textContent = "Pick HEAD or TAIL";
  }

  async function playDaily(userPick) {
    if (state.tossing) return;

    // すでに今日済みなら無視
    const last = window.localStorage.getItem(LS.dailyDate);
    if (last === todayStr()) {
      enterDaily();
      return;
    }

    state.tossing = true;
    dailyPickHead.disabled = true;
    dailyPickTail.disabled = true;
    dailyMsg.textContent = "Tossing...";

    const r = randResult();
    await tossAnimation(dailyCoin, 1100);
    dailyCoin.src = IMG[r];

    if (userPick === r) {
      dailyMsg.textContent = "Correct! +1 Title Point";
      // 今日完了扱い & ポイント加算
      window.localStorage.setItem(LS.dailyDate, todayStr());
      addTitlePoint(1);
    } else {
      dailyMsg.textContent = `Miss... (Result: ${r})`;
      // 外れても「今日完了」にするかどうか：
      // 今回は “1日1回” なので、外れても今日分消費（＝完了）にする設計が自然
      window.localStorage.setItem(LS.dailyDate, todayStr());
      refreshStartUI();
    }

    dailyAgainBtn.classList.remove("hidden");
    state.tossing = false;
  }

  dailyPickHead.addEventListener("click", () => playDaily("HEAD"));
  dailyPickTail.addEventListener("click", () => playDaily("TAIL"));

  dailyAgainBtn.addEventListener("click", () => {
    refreshStartUI();
    showScreen("start");
  });

  // ========= CHAIN OF LUCK =========
  function enterChain() {
    state.chainStreak = 0;
    chainCoin.src = IMG.HEAD;
    chainMsg.textContent = "Pick HEAD or TAIL";
    chainRestartBtn.classList.add("hidden");

    chainPickHead.disabled = false;
    chainPickTail.disabled = false;

    chainBestEl.textContent = String(state.chainBest);
    chainStreakEl.textContent = String(state.chainStreak);
    setGlowByStreak(chainCoin, state.chainStreak);
  }

  async function playChain(userPick) {
    if (state.tossing) return;
    state.tossing = true;

    chainPickHead.disabled = true;
    chainPickTail.disabled = true;
    chainMsg.textContent = "Tossing...";

    const r = randResult();
    await tossAnimation(chainCoin, 900);
    chainCoin.src = IMG[r];

    if (userPick === r) {
      state.chainStreak += 1;
      chainStreakEl.textContent = String(state.chainStreak);
      chainMsg.textContent = `Correct! Streak: ${state.chainStreak}`;

      setGlowByStreak(chainCoin, state.chainStreak);

      chainPickHead.disabled = false;
      chainPickTail.disabled = false;
      state.tossing = false;
      return;
    }

    // Miss -> 終了
    chainMsg.textContent = `Miss... (Result: ${r}) Final Streak: ${state.chainStreak}`;

    // Best更新
    if (state.chainStreak > state.chainBest) {
      state.chainBest = state.chainStreak;
      writeInt(LS.chainBest, state.chainBest);
      chainBestEl.textContent = String(state.chainBest);
      chainMsg.textContent += "  NEW BEST!";
    }

    chainRestartBtn.classList.remove("hidden");
    state.tossing = false;
  }

  chainPickHead.addEventListener("click", () => playChain("HEAD"));
  chainPickTail.addEventListener("click", () => playChain("TAIL"));

  chainRestartBtn.addEventListener("click", () => {
    enterChain();
  });

  // ========= 初期表示 =========
  refreshStartUI();
  showScreen("start");
});



