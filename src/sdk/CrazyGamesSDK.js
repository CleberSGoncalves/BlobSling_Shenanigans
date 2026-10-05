// ============================================================
// CrazyGames SDK v3 — Wrapper com fallback gracioso
// ============================================================

let sdkReady = false;

export async function initCrazyGames() {
  try {
    if (window.CrazyGames && window.CrazyGames.SDK) {
      await window.CrazyGames.SDK.init();
      sdkReady = true;
      console.log('[CrazyGames] SDK v3 inicializado com sucesso.');
    }
  } catch (e) {
    console.warn('[CrazyGames] SDK não disponível (fallback gracioso):', e);
  }
}

export function gameplayStart() {
  try {
    if (sdkReady && window.CrazyGames?.SDK?.game) {
      window.CrazyGames.SDK.game.gameplayStart();
    }
  } catch (e) { /* silencioso */ }
}

export function gameplayStop() {
  try {
    if (sdkReady && window.CrazyGames?.SDK?.game) {
      window.CrazyGames.SDK.game.gameplayStop();
    }
  } catch (e) { /* silencioso */ }
}

export function showRewardedAd(onReward, onError) {
  gameplayStop();
  if (sdkReady && window.CrazyGames?.SDK?.ad) {
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adStarted: () => console.log('[CrazyGames] Rewarded Ad started'),
      adFinished: () => {
        gameplayStart();
        if (onReward) onReward();
      },
      adError: (err) => {
        console.warn('[CrazyGames] Rewarded Ad error:', err);
        gameplayStart();
        if (onReward) onReward(); // Fallback: recompensa mesmo assim
      }
    });
  } else {
    // Fallback sem SDK
    setTimeout(() => {
      gameplayStart();
      if (onReward) onReward();
    }, 500);
  }
}

export function showMidgameAd(onComplete) {
  gameplayStop();
  if (sdkReady && window.CrazyGames?.SDK?.ad) {
    window.CrazyGames.SDK.ad.requestAd('midgame', {
      adStarted: () => console.log('[CrazyGames] Midgame Ad started'),
      adFinished: () => {
        gameplayStart();
        if (onComplete) onComplete();
      },
      adError: () => {
        gameplayStart();
        if (onComplete) onComplete();
      }
    });
  } else {
    setTimeout(() => {
      gameplayStart();
      if (onComplete) onComplete();
    }, 300);
  }
}
