// ============================================
// QuestManager.js — Quest Logic & HUD
// Birthday Quest RPG · Tahap 7
// ============================================

import { QUEST_DATA }  from '../data/quests.js';
import GameState       from './GameState.js';
import SoundManager    from './SoundManager.js';

// ============================================
// DOM REFERENCES — lazy init
// ============================================

let hudEl, hudQuestTitle, hudProgressFill, hudProgressText;
let notifEl, notifText, fadeOverlay;
let notifTimer = null;

function initDOM() {
  if (hudEl) return;
  hudEl           = document.getElementById('hud');
  hudQuestTitle   = document.getElementById('hud-quest-title');
  hudProgressFill = document.getElementById('hud-progress-fill');
  hudProgressText = document.getElementById('hud-progress-text');
  notifEl         = document.getElementById('notif');
  notifText       = document.getElementById('notif-text');
  fadeOverlay     = document.getElementById('fade-overlay');
}

// ============================================
// QUEST MANAGER
// ============================================

const QuestManager = {

  startQuest(id) {
    initDOM();
    const data = QUEST_DATA[id];
    if (!data) return;
    SoundManager.questNew();
    this.showNotif('Quest Baru!', data.title, 'notif-quest-new');
    this.refreshHUD();
  },

  onQuestComplete(id) {
    initDOM();
    const data = QUEST_DATA[id];
    if (!data) return;

    SoundManager.questComplete();
    this.showNotif('Quest Selesai!', data.title, 'notif-quest-done');

    if (data.reward) {
      setTimeout(() => this.showNotif('Item Didapat!', data.reward.name, 'notif-item'), 500);
    }

    this.refreshHUD();

    const allDone = Object.values(GameState.quests).every(q => q.status === 'done');
    if (allDone) setTimeout(() => this.triggerEnding(), 2000);
  },

  triggerEnding() {
    initDOM();
    // Import DialogEngine saat dibutuhkan — hindari circular import di top level
    import('./DialogEngine.js').then(({ default: DialogEngine }) => {
      GameState.gamePhase = 'cutscene';
      hudEl?.classList.add('hidden');
      if (fadeOverlay) fadeOverlay.classList.add('fade-in');
      SoundManager.ending();
      setTimeout(() => DialogEngine.start('ending_cutscene'), 900);
    });
  },

  refreshHUD() {
    initDOM();
    if (!hudEl) return;

    const activeEntry = Object.entries(GameState.quests)
      .find(([, q]) => q.status === 'active');

    if (!activeEntry) {
      const anyStarted = Object.values(GameState.quests).some(q => q.status !== 'inactive');
      if (!anyStarted) hudEl.classList.add('hidden');
      return;
    }

    const [id, questState] = activeEntry;
    const data = QUEST_DATA[id];
    if (!data) return;

    hudEl.classList.remove('hidden');
    if (hudQuestTitle) hudQuestTitle.textContent = data.title;

    const pct = questState.total > 0 ? (questState.progress / questState.total) * 100 : 0;
    if (hudProgressFill) hudProgressFill.style.width = `${pct}%`;
    if (hudProgressText) hudProgressText.textContent = `${questState.progress} / ${questState.total}`;
  },

  showNotif(label, text, variant = '') {
    initDOM();
    if (!notifEl) return;

    if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; }

    notifEl.className = '';
    notifEl.classList.add(variant);
    if (notifText) notifText.textContent = `${label} ${text}`;

    notifEl.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      notifEl.classList.add('visible');
    }));

    notifTimer = setTimeout(() => {
      notifEl.classList.remove('visible');
      setTimeout(() => notifEl?.classList.add('hidden'), 220);
    }, 2500);
  },
};

// ============================================
// HOOK KE GAMESTATE
// ============================================

GameState._onQuestUpdate = () => QuestManager.refreshHUD();

GameState._onQuestComplete = (id) => {
  const data = QUEST_DATA[id];
  if (data?.reward) GameState.addToInventory(data.reward);

  const allDone = Object.values(GameState.quests).every(q => q.status === 'done');
  if (allDone) setTimeout(() => QuestManager.triggerEnding(), 2000);

  QuestManager.onQuestComplete(id);
};

const _origStartQuest = GameState.startQuest.bind(GameState);
GameState.startQuest = function(id) {
  _origStartQuest(id);
  QuestManager.startQuest(id);
};

export default QuestManager;