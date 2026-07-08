// ============================================================================
// 1. GAME CONSTANTS & BALANCING DATA REGISTRIES
// ============================================================================

export const CANVAS_W = 400;
export const CANVAS_H = 640;
export const MISS_PENALTY = 50;

export const WORKOUTS = [
  { id: 'forwardPushups', name: 'Forward Pushups', moneyPer: 10, emoji: '🤸' },
  { id: 'sidePushups', name: 'Side Pushups', moneyPer: 10, emoji: '↔️' },
  { id: 'leftHandDigs', name: 'Left Hand Digs', moneyPer: 0.5, emoji: '✋' },
  { id: 'rightHandDigs', name: 'Right Hand Digs', moneyPer: 0.5, emoji: '🤚' },
  { id: 'situps', name: 'Situps', moneyPer: 20, emoji: '💪' },
];

export const TOWERS = [
  { id: 'slingshot', name: 'Slingshot', emoji: '🎯', unlockCost: 0, placeCost: 25, damage: 10, range: 100, fireRate: 600, projectileSpeed: 320, color: '#38bdf8', desc: 'Reliable starter slingshot.' },
  { id: 'bow', name: 'Bow', emoji: '🏹', unlockCost: 150, placeCost: 40, damage: 12, range: 130, fireRate: 450, projectileSpeed: 400, color: '#10b981', desc: 'Quick single arrows.' },
  { id: 'crossbow', name: 'Crossbow', emoji: '🏹', unlockCost: 300, placeCost: 70, damage: 35, range: 150, fireRate: 1000, projectileSpeed: 500, color: '#f59e0b', desc: 'Heavy single bolts.' },
  { id: 'fire_staff', name: 'Fire Staff', emoji: '🔥', unlockCost: 450, placeCost: 90, damage: 14, range: 120, fireRate: 700, projectileSpeed: 300, color: '#ef4444', burn: 6, burnDur: 2, desc: 'Sets enemies ablaze.' },
  { id: 'ice_staff', name: 'Ice Staff', emoji: '❄️', unlockCost: 550, placeCost: 100, damage: 10, range: 120, fireRate: 600, projectileSpeed: 320, color: '#06b6d4', slow: 0.5, slowDur: 1.5, desc: 'Slows enemies down.' },
  { id: 'lightning_staff', name: 'Lightning Staff', emoji: '⚡', unlockCost: 700, placeCost: 130, damage: 18, range: 140, fireRate: 800, projectileSpeed: 0, color: '#a855f7', chain: 3, desc: 'Arcs between enemies.' },
  { id: 'cannon', name: 'Cannon', emoji: '💣', unlockCost: 800, placeCost: 140, damage: 50, range: 130, fireRate: 1800, projectileSpeed: 240, color: '#64748b', splash: 35, desc: 'Explosive splash.' },
];

export const ENEMIES = [
  { id: 'slime', hp: 25, speed: 0.7, coin: 5, color: '#10b981', size: 11 },
  { id: 'goblin', hp: 40, speed: 0.9, coin: 7, color: '#84cc16', size: 12 },
  { id: 'skeleton', hp: 60, speed: 1.0, coin: 10, color: '#e2e8f0', size: 12 },
  { id: 'spider', hp: 30, speed: 1.6, coin: 8, color: '#f43f5e', size: 10 },
  { id: 'wolf', hp: 80, speed: 1.4, coin: 14, color: '#a8a29e', size: 13 },
  { id: 'boss', hp: 2000, speed: 0.35, coin: 300, color: '#fbbf24', size: 26 },
];

export const UPGRADES = [
  { id: 'damage', name: 'Damage', desc: '+15% tower damage / level', baseCost: 120, maxLevel: 10, perLevel: 0.15 },
  { id: 'speed', name: 'Attack Speed', desc: '+10% fire rate / level', baseCost: 120, maxLevel: 10, perLevel: 0.10 },
  { id: 'range', name: 'Range', desc: '+8% range / level', baseCost: 100, maxLevel: 10, perLevel: 0.08 },
  { id: 'startingGold', name: 'Starting Gold', desc: '+10 starting battle gold / level', baseCost: 150, maxLevel: 10, perLevel: 10 },
  { id: 'maxHealth', name: 'Base Health', desc: '+5 max base health / level', baseCost: 180, maxLevel: 10, perLevel: 5 },
];

export const ABILITIES = [
  { id: 'bomb', name: 'Bomb', cost: 100, cooldown: 20, desc: 'Damage all enemies on screen.' },
  { id: 'freeze', name: 'Freeze', cost: 80, cooldown: 25, desc: 'Freeze all enemies for 3s.' },
  { id: 'repair', name: 'Repair', cost: 60, cooldown: 30, desc: 'Restore 5 base health.' },
];

export const PATH = [
  { x: 80, y: -20 }, { x: 80, y: 140 }, { x: 320, y: 140 }, { x: 320, y: 300 },
  { x: 80, y: 300 }, { x: 80, y: 460 }, { x: 320, y: 460 }, { x: 320, y: 680 },
];

export const BUILD_SPOTS = [
  { x: 160, y: 80 }, { x: 240, y: 80 }, { x: 160, y: 220 }, { x: 240, y: 220 },
  { x: 160, y: 380 }, { x: 240, y: 380 }, { x: 160, y: 540 }, { x: 240, y: 540 },
];

const SEG_LENS = [];
for (let i = 0; i < PATH.length - 1; i++) {
  SEG_LENS.push(Math.hypot(PATH[i+1].x - PATH[i].x, PATH[i+1].y - PATH[i].y));
}

// ============================================================================
// 2. ZERO-ASSET PROCEDURAL WEB AUDIO SYNTHESIZER
// ============================================================================

let audioCtx = null;
let musicMuted = false;
let musicIntervalToken = null;
let musicDroneNode = null;
let musicGainNode = null;
let musicalSequenceStep = 0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function initSound() {
  const c = getAudioContext();
  if (c.state === 'suspended') c.resume();
}

export function isMuted() { return musicMuted; }

export function setMuted(m) {
  musicMuted = !!m;
  if (musicMuted) stopMusic();
}

function synthesizeTone({ type = 'sine', freq = 440, freqEnd, dur = 0.15, vol = 0.05, glide = true }) {
  if (musicMuted) return;
  try {
    const c = getAudioContext();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd && glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
    
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {}
}

export function playShoot() { synthesizeTone({ type: 'square', freq: 440, freqEnd: 150, dur: 0.09, vol: 0.03 }); }
export function playDeath() { synthesizeTone({ type: 'sawtooth', freq: 320, freqEnd: 70, dur: 0.2, vol: 0.05 }); }
export function playPlace() { synthesizeTone({ type: 'triangle', freq: 180, freqEnd: 120, dur: 0.12, vol: 0.07 }); }
export function playUpgrade() { synthesizeTone({ type: 'triangle', freq: 330, dur: 0.1, vol: 0.05 }); }
export function playSell() { synthesizeTone({ type: 'sine', freq: 220, freqEnd: 300, dur: 0.12, vol: 0.05 }); }
export function playAbility() { synthesizeTone({ type: 'sawtooth', freq: 600, freqEnd: 200, dur: 0.25, vol: 0.06 }); }
export function playWave() { synthesizeTone({ type: 'triangle', freq: 330, dur: 0.18, vol: 0.06 }); }
export function playGameOver() { synthesizeTone({ type: 'sawtooth', freq: 250, freqEnd: 40, dur: 0.6, vol: 0.08 }); }

const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0];

export function startMusic() {
  if (musicMuted || musicIntervalToken) return;
  try {
    const c = getAudioContext();
    musicDroneNode = c.createOscillator();
    musicGainNode = c.createGain();
    
    musicDroneNode.type = 'sine';
    musicDroneNode.frequency.value = 65.41;
    musicGainNode.gain.value = 0.015;
    
    musicDroneNode.connect(musicGainNode).connect(c.destination);
    musicDroneNode.start();
    
    musicalSequenceStep = 0;
    musicIntervalToken = setInterval(() => {
      if (musicMuted) return;
      const cc = getAudioContext();
      const t = cc.currentTime;
      const osc = cc.createOscillator();
      const gain = cc.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = PENTATONIC_SCALE[musicalSequenceStep % PENTATONIC_SCALE.length];
      
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      
      osc.connect(gain).connect(cc.destination);
      osc.start(t);
      osc.stop(t + 0.55);
      musicalSequenceStep++;
    }, 600);
  } catch {}
}

export function stopMusic() {
  if (musicIntervalToken) { clearInterval(musicIntervalToken); musicIntervalToken = null; }
  if (musicDroneNode) { try { musicDroneNode.stop(); } catch {} musicDroneNode = null; }
}

// ============================================================================
// 3. CORE STATE MOVEMENT & GAME ENGINE LOGIC LOOP
// ============================================================================

export class GameEngine {
  constructor({ unlockedTowers, upgrades, coins }) {
    this.unlockedTowers = unlockedTowers || ['slingshot'];
    this.upgrades = upgrades || {};
    this.persistedCoins = coins || 0;
    this.selectedWeapon = this.unlockedTowers[0] || 'slingshot';
    this.reset();
  }

  get startingGold() { return Math.max(50, this.persistedCoins) + (this.upgrades.startingGold || 0) * 10; }
  get maxLives() { return 20 + (this.upgrades.maxHealth || 0) * 5; }

  reset() {
    this.towers = []; this.enemies = []; this.projectiles = []; this.lightnings = []; this.events = [];
    this.inGameMoney = this.startingGold; this.lives = this.maxLives; this.wave = 0;
    this.spawnQueue = []; this.spawnTimer = 0; this.phase = 'ready'; this.waveHpMult = 1;
    this.score = 0; this.kills = 0; this.freezeTimer = 0;
    this.abilityCooldowns = { bomb: 0, freeze: 0, repair: 0 };
  }

  effStats(w) {
    const u = this.upgrades;
    return {
      damage: w.damage * (1 + (u.damage || 0) * 0.15),
      range: w.range * (1 + (u.range || 0) * 0.08),
      fireRate: w.fireRate * (1 - (u.speed || 0) * 0.10),
    };
  }

  placeTower(spot, weaponId) {
    if (this.phase === 'gameover' || this.towers.some(t => t.spot === spot)) return false;
    const w = TOWERS.find(t => t.id === weaponId);
    if (!w || !this.unlockedTowers.includes(weaponId) || this.inGameMoney < w.placeCost) return false;
    
    this.inGameMoney -= w.placeCost;
    this.towers.push({ spot, weapon: w, cooldown: 0, level: 1, ...this.effStats(w) });
    this.events.push('place');
    return true;
  }

  upgradeTower(spot) {
    const t = this.towers.find(x => x.spot === spot);
    const cost = t ? Math.floor(t.weapon.placeCost * t.level * 0.7) : 0;
    if (!t || this.inGameMoney < cost) return false;
    this.inGameMoney -= cost; t.level++; t.damage *= 1.25; t.range *= 1.1; t.fireRate *= 0.95;
    this.events.push('upgrade'); return true;
  }


  sellTower(spot) {
    const idx = this.towers.findIndex(t => t.spot === spot);
    if (idx === -1) return false;
    this.inGameMoney += Math.floor(this.towers[idx].weapon.placeCost * this.towers[idx].level * 0.5);
    this.towers.splice(idx, 1);
    this.events.push('sell');
    return true;
  }

  getTower(spot) {
    const t = this.towers.find(x => x.spot === spot);
    if (!t) return null;
    return {
      name: t.weapon.name,
      color: t.weapon.color,
      level: t.level,
      damage: Math.round(t.damage),
      range: Math.round(t.range),
      upgradeCost: Math.floor(t.weapon.placeCost * t.level * 0.7),
      sellRefund: Math.floor(t.weapon.placeCost * t.level * 0.5)
    };
  }

  startWave() {
    if (this.phase !== 'ready') return false;
    this.wave++;
    this.waveHpMult = 1 + (this.wave - 1) * 0.2;
    this.spawnQueue = [];
    const count = 6 + Math.floor(this.wave * 1.5);
    const pool = ['slime'];
    if (this.wave >= 2) pool.push('goblin');
    if (this.wave >= 3) pool.push('spider');
    if (this.wave >= 5) pool.push('skeleton');
    if (this.wave >= 6) pool.push('wolf');
    for (let i = 0; i < count; i++) {
      this.spawnQueue.push({ type: pool[Math.floor(Math.random() * pool.length)], delay: i * 0.6 });
    }
    this.spawnTimer = 0;
    this.phase = 'spawning';
    this.events.push('wave');
    return true;
  }

  useAbility(id) {
    const ab = ABILITIES.find(a => a.id === id);
    if (!ab || this.abilityCooldowns[id] > 0 || this.inGameMoney < ab.cost) return false;
    this.inGameMoney -= ab.cost;
    this.abilityCooldowns[id] = ab.cooldown;
    if (id === 'bomb') {
      const d = 100 + this.wave * 20;
      this.enemies.forEach(e => {
        e.hp -= d;
        if (e.hp <= 0 && !e.dead) {
          e.dead = true;
          this.inGameMoney += e.def.coin;
          this.kills++;
        }
      });
    } else if (id === 'freeze') {
      this.freezeTimer = 3.0;
    } else if (id === 'repair') {
      this.lives = Math.min(this.maxLives, this.lives + 5);
    }
    this.events.push('ability');
    return true;
  }

  update(dt) {
    if (this.phase === 'gameover') return;
    for (const k in this.abilityCooldowns) {
      if (this.abilityCooldowns[k] > 0) this.abilityCooldowns[k] = Math.max(0, this.abilityCooldowns[k] - dt);
    }
    if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
  }

  getSpotAt(x, y) {
    return BUILD_SPOTS.findIndex(s => Math.hypot(x - s.x, y - s.y) <= 22);
  }

  isSpotOccupied(i) {
    return this.towers.some(t => t.spot === i);
  }

  getStats() {
    return {
      inGameMoney: this.inGameMoney,
      lives: this.lives,
      maxLives: this.maxLives,
      wave: this.wave,
      phase: this.phase,
      enemiesLeft: this.enemies.length + this.spawnQueue.length,
      score: this.score,
      kills: this.kills,
      abilityCooldowns: { ...this.abilityCooldowns },
      freezeTimer: this.freezeTimer
    };
  }

  static calculateUpgradeCost(id, lvl) {
    const cfg = UPGRADES.find(u => u.id === id);
    return cfg ? Math.floor(cfg.baseCost * Math.pow(1.45, lvl - 1)) : Infinity;
  }

  render(ctx) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (this.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
    ctx.stroke();
    BUILD_SPOTS.forEach((s, i) => {
      const occ = this.isSpotOccupied(i);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = occ ? '#1c1917' : '#44403c';
      ctx.fill();
      ctx.strokeStyle = occ ? '#78716c' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
}

