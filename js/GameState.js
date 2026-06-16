// ============================================
// GameState.js — Single Source of Truth
// Birthday Quest RPG
//
// Perubahan dari versi sebelumnya:
//   - npcInteracted: Set — tracking NPC yang sudah diajak ngobrol
//   - hasKey: boolean — player sudah dapat kunci atau belum
//   - allNPCsInteracted(): cek apakah semua NPC sudah dikunjungi
//   - _onKeyObtained: hook — di-override oleh main.js untuk animasi
// ============================================

import { QUEST_DATA } from '../data/quests.js';
import { SPAWN, TILE_SIZE, NPCS } from '../data/maps.js';

// ============================================
// GAMESTATE SINGLETON
// ============================================

const GameState = {

  // ── Player ──
  player: {
    x:     SPAWN.col * TILE_SIZE,
    y:     SPAWN.row * TILE_SIZE,
    name:  'Bestie',
    hp:    100,
    level: 1,
  },

  // ── Quest Registry ──
  quests: Object.fromEntries(
    Object.keys(QUEST_DATA).map(id => [
      id,
      { status: 'inactive', progress: 0, total: QUEST_DATA[id].total },
    ])
  ),

  // ── Inventory ──
  inventory: [],

  // ── Dialog Flags ──
  dialogFlags: {},

  // ── Game Phase ──
  gamePhase: 'playing',

  // ── NPC Interaction Tracker ──                          ← BARU
  // Set berisi id NPC yang sudah pernah diajak ngobrol sampai selesai.
  // Diisi oleh DialogEngine saat close() setelah interaksi NPC.
  npcInteracted: new Set(),

  // ── Key State ──                                        ← BARU
  // true  = player sudah memegang kunci (item sudah di inventory)
  // false = belum dapat kunci
  hasKey: false,

  // ============================================
  // NPC INTERACTION METHODS                               ← BARU
  // ============================================

  /**
   * markNPCInteracted(npcId)
   * Catat bahwa NPC ini sudah selesai diajak ngobrol.
   * Dipanggil dari DialogEngine.close() via hook _onDialogClose.
   *
   * Setelah semua NPC tercatat → panggil giveKey().
   */
  markNPCInteracted(npcId) {
    if (this.npcInteracted.has(npcId)) return; // sudah pernah, skip
    this.npcInteracted.add(npcId);
    console.log(`[GameState] NPC interacted: ${npcId} | Total: ${this.npcInteracted.size}/${NPCS.length}`);

    if (this.allNPCsInteracted()) {
      this.giveKey();
    }
  },

  /**
   * allNPCsInteracted()
   * Return true jika semua NPC di NPCS sudah pernah diajak ngobrol.
   */
  allNPCsInteracted() {
    return NPCS.every(npc => this.npcInteracted.has(npc.id));
  },

  /**
   * giveKey()
   * Beri kunci ke player.
   * Tambah ke inventory & set hasKey = true.
   * Panggil hook _onKeyObtained agar main.js bisa tampilkan animasi.
   */
  giveKey() {
    if (this.hasKey) return; // idempoten — jangan dobel kasih kunci
    this.hasKey = true;

    const keyItem = {
      id:      'key_next_map',
      name:    '🗝️ Kunci Pintu Berikutnya',
      type:    'key',
      content: 'Kunci untuk membuka pintu yang ada di pojok kanan bawah. Ke mana pintu ini mengarah?',
    };

    this.addToInventory(keyItem);
    console.log('[GameState] Key obtained! hasKey = true');

    // Notif ke modul lain (main.js akan override ini)
    this._onKeyObtained();
  },

  /**
   * _onKeyObtained — hook                                 ← BARU
   * Di-override oleh main.js untuk:
   *   1. Tampilkan animasi kunci di layar
   *   2. Tampilkan notifikasi HUD
   *   3. Update tile locked door jadi walkable
   */
  _onKeyObtained() {
    console.log('[GameState] Key obtained hook (default). Override di main.js.');
  },

  // ============================================
  // QUEST METHODS
  // ============================================

  startQuest(id) {
    const q = this.quests[id];
    if (!q || q.status !== 'inactive') return;
    q.status = 'active';
    console.log(`[Quest] Started: ${id}`);
    this._onQuestUpdate(id);
  },

  updateQuest(id, amount = 1) {
    const q = this.quests[id];
    if (!q || q.status !== 'active') return;

    q.progress = Math.min(q.progress + amount, q.total);
    console.log(`[Quest] Progress ${id}: ${q.progress}/${q.total}`);

    if (q.progress >= q.total) {
      q.status = 'done';
      console.log(`[Quest] Completed: ${id}`);
      this._onQuestComplete(id);
    }

    this._onQuestUpdate(id);
  },

  _onQuestComplete(id) {
    console.log('[GameState] Quest complete hook:', id);
  },

  _onQuestUpdate(id) {
    // Di-override oleh QuestManager.js
  },

  // ============================================
  // INVENTORY METHODS
  // ============================================

  addToInventory(item) {
    const exists = this.inventory.some(i => i.id === item.id);
    if (exists) return;
    this.inventory.push({ ...item });
    console.log(`[Inventory] Added: ${item.name}`);
  },

  // ============================================
  // DIALOG FLAG METHODS
  // ============================================

  setFlag(key) {
    this.dialogFlags[key] = true;
  },

  getFlag(key) {
    return this.dialogFlags[key] === true;
  },

  // ============================================
  // SAVE / LOAD
  // ============================================

  toSaveData() {
    return {
      quests:         this.quests,
      inventory:      this.inventory,
      dialogFlags:    this.dialogFlags,
      hasKey:         this.hasKey,                           // ← BARU
      npcInteracted:  [...this.npcInteracted],               // ← BARU (Set → Array)
      player: {
        x: this.player.x,
        y: this.player.y,
      },
    };
  },

  fromSaveData(save) {
    if (!save) return;
    Object.assign(this.quests,      save.quests      ?? {});
    Object.assign(this.inventory,   save.inventory   ?? []);
    Object.assign(this.dialogFlags, save.dialogFlags ?? {});

    // Restore key state                                    ← BARU
    if (save.hasKey) this.hasKey = true;
    if (Array.isArray(save.npcInteracted)) {
      save.npcInteracted.forEach(id => this.npcInteracted.add(id));
    }

    if (save.player) {
      this.player.x = save.player.x ?? this.player.x;
      this.player.y = save.player.y ?? this.player.y;
    }
  },

};

export default GameState;