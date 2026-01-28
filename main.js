document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM =====
  const coinImg = document.getElementById("coin");
  const tossBtn = document.getElementById("tossBtn");
  const resultEl = document.getElementById("result");

  if (!coinImg || !tossBtn || !resultEl) {
    console.error("必要な要素が見つかりません。index.htmlのIDを確認してね。");
    console.log({ coinImg, tossBtn, resultEl });
    return;
  }

  // ===== 画像パス（←ここが今回の本体） =====
  const IMG = {
    HEAD: "img/head.png",
    TAIL: "img/tail.png",
  };

  // 事前ロード（切替時のチラつき防止）
  for (const key of Object.keys(IMG)) {
    const im = new Image();
    im.src = IMG[key];
  }

  // 初期表示：HEAD
  let current = "HEAD";
  coinImg.src = IMG[current];

  let isTossing = false;

  function randomResult() {
    return Math.random() < 0.5 ? "HEAD" : "TAIL";
  }

  function toss() {
    if (isTossing) return;
    isTossing = true;

    tossBtn.disabled = true;
    tossBtn.textContent = "トス中…";
    resultEl.textContent = "トス中…";

    coinImg.classList.add("spinning");

    const r = randomResult();
    const duration = 1200;

    window.setTimeout(() => {
      coinImg.classList.remove("spinning");

      current = r;
      coinImg.src = IMG[current];

      // 表示テキスト（不要なら下の1行を消す or 空文字にしてOK）
      resultEl.textContent = `結果：${current}`;

      tossBtn.disabled = false;
      tossBtn.textContent = "コイントス";
      isTossing = false;
    }, duration);
  }

  tossBtn.addEventListener("click", toss);
});


