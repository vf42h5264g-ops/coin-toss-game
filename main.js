document.addEventListener("DOMContentLoaded", () => {
  // ====== DOM ======
  const coinImg = document.getElementById("coin");
  const tossBtn = document.getElementById("tossBtn");
  const resultEl = document.getElementById("result");

  if (!coinImg || !tossBtn || !resultEl) {
    console.error("必要な要素が見つかりません。index.htmlのIDを確認してね。");
    console.log({ coinImg, tossBtn, resultEl });
    return;
  }

  // ====== 設定 ======
  const STATE = {
    isTossing: false,
    lastResult: null, // "HEADS" | "TAILS"
  };

  // コイン画像（表裏）を分けたい場合は差し替えてOK
  // 例: assets/heads.png と assets/tails.png を用意したらここを書き換え
  const IMG = {
    HEADS: "assets/coin.png",
    TAILS: "assets/coin.png",
  };

  // ====== ユーティリティ ======
  function randomResult() {
    return Math.random() < 0.5 ? "HEADS" : "TAILS";
  }

  function toJapaneseLabel(r) {
    return r === "HEADS" ? "表" : "裏";
  }

  function setUI({ disabled, text }) {
    tossBtn.disabled = disabled;
    tossBtn.textContent = text;
  }

  // ====== メイン動作 ======
  function toss() {
    if (STATE.isTossing) return;
    STATE.isTossing = true;

    resultEl.textContent = "トス中…";
    setUI({ disabled: true, text: "トス中…" });

    // 回転アニメ用クラス（style.css側で .spinning を定義してね）
    coinImg.classList.add("spinning");

    // ここで結果を決める（最後に止まる）
    const r = randomResult();
    STATE.lastResult = r;

    // どれくらい回すか（ms）
    const duration = 1200;

    window.setTimeout(() => {
      coinImg.classList.remove("spinning");

      // 画像切替（表裏画像を用意した人向け。今は同じcoin.pngでも動く）
      coinImg.src = IMG[r];

      resultEl.textContent = `結果：${toJapaneseLabel(r)}`;
      setUI({ disabled: false, text: "コイントス" });

      STATE.isTossing = false;
    }, duration);
  }

  // ====== イベント ======
  tossBtn.addEventListener("click", toss);
});

