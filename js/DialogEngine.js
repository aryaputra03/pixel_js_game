// ============================================
// DialogEngine.js — Typewriter & Branching Dialog
// Birthday Quest RPG · Tahap 6
//
// Perubahan dari versi sebelumnya:
//   - close() sekarang memanggil _onDialogClose hook sebelum reset state
//   - _onDialogClose di-override oleh main.js untuk tracking NPC interaksi
// ============================================

import { DIALOGS } from '../data/dialogs.js';
import GameState from './GameState.js';
import SoundManager from './SoundManager.js';

// ============================================
// DOM REFERENCES — lazy init
// ============================================

let dialogBox,
  dialogSpeaker,
  dialogText,
  dialogArrow,
  dialogChoices,
  dialogHint;

function initDOM() {
  if (dialogBox) return;
  dialogBox = document.getElementById('dialog-box');
  dialogSpeaker = document.getElementById('dialog-speaker');
  dialogText = document.getElementById('dialog-text');
  dialogArrow = document.getElementById('dialog-arrow');
  dialogChoices = document.getElementById('dialog-choices');
  dialogHint = document.getElementById('dialog-hint');

  dialogBox?.addEventListener('click', (e) => {
    if (e.target.classList.contains('choice-btn')) return;
    DialogEngine.advance();
  });
}

// ============================================
// CONSTANTS
// ============================================

const TYPEWRITER_SPEED = 30;
const isMobile = () => 'ontouchstart' in window;

// ============================================
// DIALOG ENGINE
// ============================================

const DialogEngine = {
  currentDialog: null,
  currentLineIdx: 0,
  currentLine: null,
  timer: null,
  isTyping: false,
  isOpen: false,

  // Id dialog yang sedang berjalan — dipakai hook close()
  // untuk tahu apakah ini dialog NPC atau cutscene
  _activeDialogId: null,

  // ── PUBLIC API ──

  start(dialogId) {
    initDOM();
    const dialog = DIALOGS[dialogId];
    if (!dialog) {
      console.warn('[DialogEngine] Dialog not found:', dialogId);
      this.close();
      return;
    }
    this.currentDialog = dialog;
    this.currentLineIdx = 0;
    this.isOpen = true;
    this._activeDialogId = dialogId; // ← simpan id aktif
    GameState.gamePhase = 'dialog';
    this._showDialog();
    this._showLine(0);
  },

  advance() {
    if (!this.isOpen) return;
    SoundManager.dialogAdvance();
    if (this.isTyping) {
      this.skip();
      return;
    }
    if (this.currentLine?.choices?.length) return;
    this._nextLine();
  },

  skip() {
    if (!this.isTyping) return;
    clearInterval(this.timer);
    this.timer = null;
    this.isTyping = false;
    if (dialogText) dialogText.textContent = this.currentLine.text;
    this._onTypingDone();
  },

  // ── PRIVATE ──

  _showDialog() {
    SoundManager.dialogOpen();
    dialogBox?.classList.remove('hidden', 'closing');
    if (dialogHint)
      dialogHint.textContent = isMobile()
        ? 'E untuk lanjut'
        : 'SPACE untuk lanjut';
  },

  _hideDialog() {
    SoundManager.dialogClose();
    dialogBox?.classList.add('closing');
    setTimeout(() => {
      dialogBox?.classList.add('hidden');
      dialogBox?.classList.remove('closing');
    }, 160);
  },

  _showLine(idx) {
    const line = this.currentDialog.lines[idx];
    if (!line) {
      this.close();
      return;
    }

    this.currentLine = line;
    this.currentLineIdx = idx;

    if (dialogSpeaker) dialogSpeaker.textContent = line.speaker ?? '';
    if (dialogText) dialogText.textContent = '';
    if (dialogArrow) dialogArrow.style.display = 'none';
    if (dialogChoices) dialogChoices.innerHTML = '';

    this._typeText(line.text, () => this._onTypingDone());
  },

  _typeText(text, onDone) {
    initDOM();
    this.isTyping = true;
    let i = 0,
      tickCount = 0;

    this.timer = setInterval(() => {
      if (!dialogText) return;
      dialogText.textContent += text[i];
      i++;
      tickCount++;
      if (tickCount % 4 === 0) SoundManager.typewriterTick();

      if (i >= text.length) {
        clearInterval(this.timer);
        this.timer = null;
        this.isTyping = false;
        onDone?.();
      }
    }, TYPEWRITER_SPEED);
  },

  _onTypingDone() {
    if (this.currentLine?.onEnd) this._handleEvent(this.currentLine.onEnd);
    if (this.currentLine?.choices?.length) {
      this._showChoices(this.currentLine.choices);
    } else {
      if (dialogArrow) dialogArrow.style.display = 'inline';
    }
  },

  _showChoices(choices) {
    if (!dialogChoices) return;
    dialogChoices.innerHTML = '';
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => this._handleChoice(choice));
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this._handleChoice(choice);
      });
      dialogChoices.appendChild(btn);
    });
  },

  _handleChoice(choice) {
    if (dialogChoices) dialogChoices.innerHTML = '';
    if (choice.next) this.start(choice.next);
    else this.close();
  },

  _nextLine() {
    const nextIdx = this.currentLineIdx + 1;
    if (nextIdx < this.currentDialog.lines.length) this._showLine(nextIdx);
    else this.close();
  },

  _handleEvent(eventStr) {
    const [action, param] = eventStr.split(':');
    switch (action) {
      case 'startQuest':
        GameState.startQuest(param);
        break;
      case 'updateQuest':
        GameState.updateQuest(param);
        break;
      case 'setFlag':
        GameState.setFlag(param);
        break;
      default:
        console.warn('[DialogEngine] Unknown event:', eventStr);
    }
  },

  // ── CLOSE ──

  close() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Panggil hook SEBELUM reset state,                   ← BARU
    // sehingga hook bisa akses _activeDialogId & info dialog
    this._onDialogClose(this._activeDialogId);

    this.isTyping = false;
    this.isOpen = false;
    this.currentDialog = null;
    this.currentLine = null;
    this._activeDialogId = null; // ← reset

    this._hideDialog();
    GameState.gamePhase = 'playing';
  },

  /**
   * _onDialogClose(dialogId) — hook                       ← BARU
   *
   * Dipanggil setiap kali dialog selesai / ditutup.
   * Di-override oleh main.js untuk:
   *   - Cek apakah dialogId adalah dialog NPC
   *   - Panggil GameState.markNPCInteracted(npcId)
   *
   * Default: no-op
   *
   * @param {string|null} dialogId - id dialog yang baru selesai
   */
  _onDialogClose(dialogId) {
    // Di-override oleh main.js
  },
};

export default DialogEngine;
