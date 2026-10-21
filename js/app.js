import {
  REG, BAUD_TABLE, REGISTERS,
  SerialLink, MockLink, le16, to16, toSigned,
} from './protocol.js';
import {
  MAX_RES, JOINT_OF_ID, CONTINUOUS_JOINTS,
  homingOffsetFromPosition, encodeHomingOffset,
  buildCalibrationData, calibrationPath, downloadText, downloadBytes,
  parseXdat, buildXdat, XDAT_DATA_LEN,
} from './calib.js';
import { t, getLang, setLang, toggleLang } from './i18n.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ARMS = ['leader', 'follower'];
const armName = (arm) => t(arm === 'leader' ? 'leader' : 'follower');

const state = {
  mock: false,
  arms: {
    leader: { link: null, servos: [], pos: {}, info: {}, connecting: false },
    follower: { link: null, servos: [], pos: {}, info: {}, connecting: false },
  },
  remote: { running: false, timer: null },
  wizard: null,
  ft: { arm: 'leader', servo: null, regs: {}, xdat: null, xdatName: '' },
  polling: false,
};

const ui = { calib: {}, single: {}, wiz: null, ftRows: {} };

/* ------------------------------------------------------------------ */
/* logging                                                             */
/* ------------------------------------------------------------------ */

function log(msg, level = 'info') {
  const el = $('#log');
  const line = document.createElement('div');
  const ts = new Date().toLocaleTimeString();
  line.innerHTML = `<span class="ts">[${ts}]</span> ${escapeHtml(msg)}`;
  if (level === 'error') line.style.color = 'var(--red)';
  if (level === 'warn') line.style.color = 'var(--orange)';
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  while (el.childElementCount > 500) el.firstChild.remove();
}

/* ------------------------------------------------------------------ */
/* i18n                                                                */
/* ------------------------------------------------------------------ */

function applyI18n() {
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $('#btn-lang').textContent = t('language');
  renderAllDynamic();
  updatePortChips();
}

/* ------------------------------------------------------------------ */
/* connection                                                          */
/* ------------------------------------------------------------------ */

async function connectArm(arm) {
  const st = state.arms[arm];
  if (st.connecting) return;

  if (st.link?.connected) {
    await st.link.close();
    st.link = null;
    st.servos = [];
    log(t('disconnectedMsg', armName(arm)));
    updatePortChips();
    renderAllDynamic();
    return;
  }

  st.connecting = true;
  updatePortChips();
  try {
    let link;
    if (state.mock) {
      link = new MockLink(arm);
      log(t('mockNotice'), 'warn');
    } else {
      link = await SerialLink.request(1000000, arm);
    }
    st.link = link;
    st.servos = await scanArm(arm);
    if (!st.servos.length) throw new Error(t('noServos'));
    log(t('connected', armName(arm)));
    log(t('scanDone', st.servos.join(', ')));
    updatePortChips();
    renderAllDynamic();
    if (state.ft.arm === arm) {
      state.ft.servo = null;
      refreshFtServoSelect();
    }
  } catch (e) {
    log(t('connectFailed', e.message || e), 'error');
    if (st.link) { try { await st.link.close(); } catch { /* ignore */ } }
    st.link = null;
  } finally {
    st.connecting = false;
    updatePortChips();
    renderAllDynamic();
  }
}

async function scanArm(arm) {
  const st = state.arms[arm];
  const found = [];
  for (let id = 1; id <= 20; id++) {
    try {
      if (await st.link.ping(id)) found.push(id);
    } catch (e) {
      log(`scan ID${id}: ${e.message || e}`, 'warn');
      break;
    }
  }
  return found;
}

function updatePortChips() {
  for (const arm of ARMS) {
    const st = state.arms[arm];
    const on = !!st.link?.connected;
    const chip = $(`#status-${arm}`);
    chip.textContent = st.connecting ? t('connecting') : (on ? (state.mock ? 'DEMO' : 'ON') : t('notConnected'));
    chip.classList.toggle('on', on);
    const btn = $(`#btn-connect-${arm}`);
    btn.textContent = on ? t('disconnect') : t('connect');
    btn.disabled = st.connecting;
    const conn = $(`#conn-${arm}`);
    if (conn) {
      conn.textContent = on ? (state.mock ? 'DEMO' : 'CONNECTED') : t('notConnected');
      conn.classList.toggle('on', on);
    }
    const sconn = $(`#single-conn-${arm}`);
    if (sconn) {
      sconn.textContent = on ? (state.mock ? 'DEMO' : 'CONNECTED') : t('notConnected');
      sconn.classList.toggle('on', on);
    }
  }
  $('#btn-remote').textContent = state.remote.running ? t('remoteStop') : t('remote');
  $('#btn-remote').classList.toggle('primary', !state.remote.running);
}

/* ------------------------------------------------------------------ */
/* low-level helpers                                                   */
/* ------------------------------------------------------------------ */

async function writeEeprom(link, id, address, value, length = 2, verify = true) {
  await link.write(id, REG.LOCK, [0]);
  await sleep(60);
  const data = length === 2 ? le16(value) : [value & 0xFF];
  const ok = await link.write(id, address, data);
  await sleep(40);
  await link.write(id, REG.LOCK, [1]);
  if (!ok) throw new Error(t('failWrite'));
  if (verify) {
    await sleep(30);
    const back = await link.read(id, address, length);
    if (!back) throw new Error(t('readFailed'));
    const got = length === 2 ? to16(back[0], back[1]) : back[0];
    if (got !== value) throw new Error(t('verifyFailed', value, got));
  }
}

async function readRegister(link, id, address, length) {
  const data = await link.read(id, address, length);
  if (!data) return null;
  return length === 2 ? to16(data[0], data[1]) : data[0];
}

async function resetServoCalibration(arm) {
  const st = state.arms[arm];
  for (const id of st.servos) {
    await writeEeprom(st.link, id, REG.OFS, 0);
    await writeEeprom(st.link, id, REG.MIN_LIMIT, 0);
    await writeEeprom(st.link, id, REG.MAX_LIMIT, MAX_RES);
  }
}

async function setTorque(arm, id, on) {
  const st = state.arms[arm];
  await st.link.write(id, REG.TORQUE, [on ? 1 : 0]);
}

async function setAllTorque(arm, on) {
  const st = state.arms[arm];
  for (const id of st.servos) await setTorque(arm, id, on);
}

async function sendPosition(arm, id, pos) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  const info = st.info[id];
  if (!info?.torque) {
    if (!confirm(t('torqueConfirm', id))) return;
    await setTorque(arm, id, true);
    await sleep(30);
  }
  await st.link.write(id, REG.GOAL_POS, le16(pos));
  log(`ID${id} → ${pos}`);
}

/* ------------------------------------------------------------------ */
/* polling                                                             */
/* ------------------------------------------------------------------ */

async function pollOnce() {
  if (state.polling || state.remote.running) return;
  state.polling = true;
  try {
    for (const arm of ARMS) {
      const st = state.arms[arm];
      if (!st.link?.connected) continue;
      for (const id of st.servos) {
        let d;
        try {
          // 40..64 covers torque, goal, lock, present position/speed/load/voltage/temp
          d = await st.link.read(id, REG.TORQUE, 25, 250);
        } catch { d = null; }
        if (!d || d.length < 24) { st.info[id] = null; continue; }
        st.pos[id] = to16(d[16], d[17]);
        st.info[id] = {
          torque: d[0] === 1,
          goal: to16(d[2], d[3]),
          pos: to16(d[16], d[17]),
          speed: toSigned(to16(d[18], d[19])),
          load: toSigned(to16(d[20], d[21])),
          voltage: d[22] / 10,
          temp: d[23],
        };
      }
    }
    updateLiveUI();
  } finally {
    state.polling = false;
  }
}

async function pollLoop() {
  for (;;) {
    try { await pollOnce(); } catch (e) { /* keep the loop alive */ }
    await sleep(80);
  }
}

/* ------------------------------------------------------------------ */
/* rendering                                                           */
/* ------------------------------------------------------------------ */

function buildCalibRows() {
  for (const arm of ARMS) {
    const tbody = $(`#calib-rows-${arm}`);
    tbody.innerHTML = '';
    ui.calib[arm] = {};
    for (let id = 1; id <= 6; id++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="num"><b>ID${id}</b></td>
        <td class="num p">--</td>
        <td class="num v">--</td>
        <td class="num tt">--</td>
        <td><button class="small tq">${t('torque')}</button></td>
        <td><button class="small mid">${t('middle')}</button></td>
        <td><button class="small clr">${t('clearLimits')}</button></td>`;
      tbody.appendChild(tr);
      const refs = {
        row: tr,
        p: tr.querySelector('.p'),
        v: tr.querySelector('.v'),
        tt: tr.querySelector('.tt'),
        tq: tr.querySelector('.tq'),
        mid: tr.querySelector('.mid'),
        clr: tr.querySelector('.clr'),
      };
      refs.tq.addEventListener('click', () => toggleTorque(arm, id));
      refs.mid.addEventListener('click', () => middleCalibrate(arm, id));
      refs.clr.addEventListener('click', () => clearLimits(arm, id));
      ui.calib[arm][id] = refs;
    }
  }
}

function buildSingleRows() {
  for (const arm of ARMS) {
    const box = $(`#single-rows-${arm}`);
    box.innerHTML = '';
    ui.single[arm] = {};
    for (let id = 1; id <= 6; id++) {
      const row = document.createElement('div');
      row.className = 'single-row offline';
      row.innerHTML = `
        <span class="sid">ID${id}</span>
        <input class="pos" type="number" min="0" max="4095" value="2048">
        <input class="slider" type="range" min="0" max="4095" value="2048">
        <span class="lval">L: --</span>
        <span class="rowbtns">
          <button class="small tq">${t('torque')}</button>
          <button class="small mid">${t('middle')}</button>
          <button class="small clr">${t('clearLimits')}</button>
        </span>`;
      box.appendChild(row);

      const refs = {
        row,
        pos: row.querySelector('.pos'),
        slider: row.querySelector('.slider'),
        lval: row.querySelector('.lval'),
        tq: row.querySelector('.tq'),
        dragging: false,
      };
      refs.slider.addEventListener('pointerdown', () => { refs.dragging = true; });
      window.addEventListener('pointerup', () => { refs.dragging = false; });
      refs.slider.addEventListener('input', () => {
        refs.pos.value = refs.slider.value;
        refs.lval.textContent = `L: ${refs.slider.value}`;
      });
      refs.slider.addEventListener('change', () => sendPosition(arm, id, Number(refs.slider.value)));
      refs.pos.addEventListener('change', () => {
        const v = clampPos(refs.pos.value);
        refs.pos.value = v;
        refs.slider.value = v;
        refs.lval.textContent = `L: ${v}`;
        sendPosition(arm, id, v);
      });
      refs.tq.addEventListener('click', () => toggleTorque(arm, id));
      row.querySelector('.mid').addEventListener('click', () => middleCalibrate(arm, id));
      row.querySelector('.clr').addEventListener('click', () => clearLimits(arm, id));
      ui.single[arm][id] = refs;
    }
  }
}

function clampPos(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 2048;
  return Math.max(0, Math.min(MAX_RES, n));
}

function updateLiveUI() {
  for (const arm of ARMS) {
    const st = state.arms[arm];
    const online = new Set(st.servos);
    for (let id = 1; id <= 6; id++) {
      const info = st.info[id];
      const isOn = online.has(id) && !!st.link?.connected;

      const c = ui.calib[arm]?.[id];
      if (c) {
        c.row.classList.toggle('offline', !isOn);
        c.p.textContent = isOn && info ? info.pos : '--';
        c.v.textContent = isOn && info ? info.voltage.toFixed(1) + 'V' : '--';
        c.tt.textContent = isOn && info ? info.temp + '°C' : '--';
        c.tq.classList.toggle('primary', !!info?.torque);
      }

      const s = ui.single[arm]?.[id];
      if (s) {
        s.row.classList.toggle('offline', !isOn);
        if (isOn && info) {
          const active = document.activeElement === s.pos;
          if (!active && !s.dragging) {
            if (Number(s.pos.value) !== info.pos) s.pos.value = info.pos;
            if (Number(s.slider.value) !== info.pos) s.slider.value = info.pos;
          }
          if (!s.dragging && !active) s.lval.textContent = `L: ${info.goal}`;
        }
      }
    }
  }
  updateWizardLive();
}

function renderAllDynamic() {
  buildCalibRows();
  buildSingleRows();
  updatePortChips();
  updateLiveUI();
  if (state.wizard) renderWizard();
}

/* ------------------------------------------------------------------ */
/* servo actions                                                       */
/* ------------------------------------------------------------------ */

async function toggleTorque(arm, id) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  const on = !(st.info[id]?.torque);
  try {
    await setTorque(arm, id, on);
    log(`ID${id} torque ${on ? 'ON' : 'OFF'}`);
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  }
}

async function middleCalibrate(arm, id) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  if (!confirm(t('middleConfirm', id))) return;
  try {
    await st.link.write(id, REG.TORQUE, [128]); // firmware: set current pose as middle
    log(`ID${id} ${t('middleDone')}`);
    await sleep(120);
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  }
}

async function clearLimits(arm, id) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  try {
    await writeEeprom(st.link, id, REG.MIN_LIMIT, 0);
    await writeEeprom(st.link, id, REG.MAX_LIMIT, MAX_RES);
    log(`ID${id} limits cleared`);
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  }
}

async function middleTest(arm) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  for (const id of st.servos) {
    await setTorque(arm, id, true);
    await sleep(20);
    await st.link.write(id, REG.GOAL_POS, le16(2048));
  }
  log(t('middleTestDone'));
}

async function disableMotors(arm) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  await setAllTorque(arm, false);
  log(t('disabledDone'));
}

/* ------------------------------------------------------------------ */
/* remote control                                                      */
/* ------------------------------------------------------------------ */

async function toggleRemote() {
  if (state.remote.running) {
    stopRemote();
    return;
  }
  const L = state.arms.leader;
  const F = state.arms.follower;
  if (!L.link?.connected || !F.link?.connected) { log(t('remoteNeedPorts'), 'warn'); return; }
  if (!confirm(t('confirmRemote'))) return;

  const ids = L.servos.filter((id) => F.servos.includes(id));
  if (!ids.length) { log(t('remoteNeedPorts'), 'warn'); return; }

  state.remote.running = true;
  updatePortChips();
  log(t('remoteStarted'));

  // the follower must hold torque while it is being driven
  for (const id of ids) await setTorque('follower', id, true);

  const run = async () => {
    while (state.remote.running) {
      for (const id of ids) {
        try {
          const d = await L.link.read(id, REG.PRESENT_POS, 2, 200);
          if (!d) continue;
          const pos = to16(d[0], d[1]);
          // WritePosEx layout, starting at ACC (41): acc, pos L/H, time L/H, speed L/H
          await F.link.write(id, REG.ACC, [100, pos & 0xFF, (pos >> 8) & 0xFF, 0, 0, 0xB8, 0x0B]);
        } catch { /* skip this joint for this cycle */ }
      }
      await sleep(40);
    }
  };
  run();
}

function stopRemote() {
  state.remote.running = false;
  log(t('remoteStopped'));
  updatePortChips();
}

/* ------------------------------------------------------------------ */
/* calibration wizard                                                  */
/* ------------------------------------------------------------------ */

function openWizard(arm) {
  const st = state.arms[arm];
  if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
  if (state.wizard) return;

  state.wizard = {
    arm,
    type: arm,
    id: arm === 'leader' ? 'my_leader_arm' : 'my_follower_arm',
    data: Object.fromEntries([1, 2, 3, 4, 5, 6].map((id) => [id, { center: null, min: null, max: null }])),
    centerRec: false,
    rangeRec: false,
    busy: false,
    saved: false,
    savedPath: null,
  };
  ui.wiz = null;
  $('#wiz-id').value = state.wizard.id;
  $('#wizard-sub').textContent = armName(arm);
  $('#wiz-hint').textContent = '';
  setWizardButtons();
  $('#wizard').showModal();
  renderWizard();

  log(`${t('wizardStart')} (${armName(arm)})`);
  const wiz = state.wizard;
  wiz.busy = true;
  setWizardButtons();
  (async () => {
    try {
      await setAllTorque(arm, false);
      await resetServoCalibration(arm);
      log(t('resetDone'));
    } catch (e) {
      log(t('writeFailed', e.message || e), 'error');
    } finally {
      wiz.busy = false;
      setWizardButtons();
    }
  })();
}

function setWizardButtons() {
  const w = state.wizard;
  if (!w) return;
  const c = $('#wiz-center');
  c.textContent = w.centerRec ? t('finishCenter') : t('startCenter');
  c.classList.toggle('active', w.centerRec);
  c.disabled = w.rangeRec || w.busy;
  const r = $('#wiz-range');
  r.textContent = w.rangeRec ? t('stopRange') : t('recordRange');
  r.classList.toggle('active', w.rangeRec);
  r.disabled = w.centerRec || w.busy;
  $('#wiz-save').disabled = w.centerRec || w.rangeRec || w.busy;
}

function buildWizardDom() {
  const mon = $('#wiz-monitor');
  mon.innerHTML = '';
  $('#wiz-table-body').innerHTML = '';
  ui.wiz = { mon: {}, rows: {} };
  for (let id = 1; id <= 6; id++) {
    const row = document.createElement('div');
    row.className = 'monitor-row';
    row.innerHTML = `<span class="sid">ID${id}</span><span class="pval">--</span>
      <input class="slider" type="range" min="0" max="4095" value="2048">`;
    mon.appendChild(row);
    ui.wiz.mon[id] = { val: row.querySelector('.pval'), slider: row.querySelector('.slider') };

    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="num"><b>ID${id}</b></td><td class="num c">--</td>
      <td class="num mn">--</td><td class="num mx">--</td><td class="st">--</td>`;
    $('#wiz-table-body').appendChild(tr);
    ui.wiz.rows[id] = { row: tr, c: tr.querySelector('.c'), mn: tr.querySelector('.mn'), mx: tr.querySelector('.mx'), st: tr.querySelector('.st') };
  }
}

function wizardStatus(id) {
  const w = state.wizard;
  const st = state.arms[w.arm];
  const d = w.data[id];
  const online = st.servos.includes(id) && st.link?.connected;
  if (!online) return [t('offline'), 'var(--red)'];
  if ((w.centerRec || w.rangeRec) && d.center != null) return [t('recording'), 'var(--orange)'];
  if (d.center == null) return [t('pending'), 'var(--muted)'];
  if (d.min == null || d.max == null) return [t('centerRecorded'), 'var(--indigo)'];
  return [t('done'), 'var(--green)'];
}

function renderWizard() {
  const w = state.wizard;
  if (!w) return;
  if (!ui.wiz) buildWizardDom();
  const st = state.arms[w.arm];
  for (let id = 1; id <= 6; id++) {
    const d = w.data[id];
    const r = ui.wiz.rows[id];
    r.c.textContent = d.center == null ? '--' : d.center;
    r.mn.textContent = d.min == null ? '--' : d.min;
    r.mx.textContent = d.max == null ? '--' : d.max;
    const [label, color] = wizardStatus(id);
    r.st.textContent = label;
    r.st.style.color = color;
  }
  setWizardButtons();
}

function updateWizardLive() {
  const w = state.wizard;
  if (!w || !ui.wiz) return;
  const st = state.arms[w.arm];
  for (let id = 1; id <= 6; id++) {
    const pos = st.pos[id];
    const m = ui.wiz.mon[id];
    if (!m) continue;
    if (pos != null) {
      m.val.textContent = pos;
      m.slider.value = pos;
    }
    if (w.centerRec && pos != null) {
      w.data[id].center = pos; // table follows the live Pos
    }
    if (w.rangeRec && pos != null && w.data[id].center != null) {
      const d = w.data[id];
      if (d.min == null || pos < d.min) d.min = pos;
      if (d.max == null || pos > d.max) d.max = pos;
    }
  }
  // keep the table numbers in sync while recording (cheap: 6 rows)
  for (let id = 1; id <= 6; id++) {
    const d = w.data[id];
    const r = ui.wiz.rows[id];
    r.c.textContent = d.center == null ? '--' : d.center;
    r.mn.textContent = d.min == null ? '--' : d.min;
    r.mx.textContent = d.max == null ? '--' : d.max;
    const [label, color] = wizardStatus(id);
    r.st.textContent = label;
    r.st.style.color = color;
  }
}

async function startCenterRecording() {
  const w = state.wizard;
  if (!w || w.busy) return;
  if (w.rangeRec) { log(t('pleaseStopRange'), 'warn'); return; }
  const st = state.arms[w.arm];
  w.busy = true;
  setWizardButtons();
  try {
    // Zero the offsets first: a second run would otherwise read positions that
    // already include the previous offset and the middle would drift.
    for (const id of st.servos) await writeEeprom(st.link, id, REG.OFS, 0);
    for (let id = 1; id <= 6; id++) w.data[id] = { center: null, min: null, max: null };
    w.centerRec = true;
    w.saved = false;
    $('#wiz-hint').textContent = t('recordingCenter');
    renderWizard();
    log(t('recordingCenter'));
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  } finally {
    w.busy = false;
    setWizardButtons();
  }
}

async function finishCenterRecording() {
  const w = state.wizard;
  if (!w || w.busy) return;
  w.centerRec = false;
  w.busy = true;
  setWizardButtons();
  const st = state.arms[w.arm];
  const failed = [];
  const missing = [];
  try {
    for (let id = 1; id <= 6; id++) {
      if (!st.servos.includes(id)) continue;
      const d = w.data[id];
      if (d.center == null) { missing.push(id); continue; }
      try {
        const off = homingOffsetFromPosition(d.center);
        await writeEeprom(st.link, id, REG.OFS, encodeHomingOffset(off));
        d.min = null;
        d.max = null;
      } catch (e) {
        failed.push(`ID${id}: ${e.message || e}`);
      }
    }
  } finally {
    w.busy = false;
    renderWizard();
    setWizardButtons();
  }
  if (failed.length) log(t('writeFailed', failed.join('; ')), 'error');
  else if (missing.length) log(t('noPositions', missing.map((i) => 'ID' + i).join(', ')), 'warn');
  else log(t('centerWritten', st.servos.length));
  $('#wiz-hint').textContent = failed.length ? t('writeFailed', failed.join('; ')) : t('centerWritten', st.servos.length);
}

function startRangeRecording() {
  const w = state.wizard;
  if (!w) return;
  if (w.centerRec) { log(t('pleaseFinishCenter'), 'warn'); return; }
  const st = state.arms[w.arm];
  if (st.servos.some((id) => w.data[id].center == null)) {
    log(t('pleaseRecordCenter'), 'warn');
    alert(t('pleaseRecordCenter'));
    return;
  }
  for (const id of st.servos) {
    const d = w.data[id];
    d.min = st.pos[id] ?? null;
    d.max = st.pos[id] ?? null;
  }
  w.rangeRec = true;
  w.saved = false;
  $('#wiz-hint').textContent = t('recordingRange');
  setWizardButtons();
  renderWizard();
  log(t('recordingRange'));
}

function stopRangeRecording() {
  const w = state.wizard;
  if (!w) return;
  w.rangeRec = false;
  const st = state.arms[w.arm];
  for (const id of st.servos) {
    const d = w.data[id];
    if (CONTINUOUS_JOINTS.has(JOINT_OF_ID[id])) {
      d.min = 0;
      d.max = MAX_RES;
    } else if (d.min != null && d.min === d.max) {
      d.min = d.max = null; // never moved
    }
  }
  renderWizard();
  setWizardButtons();
  log(t('rangeDone'));
  $('#wiz-hint').textContent = t('rangeDone');

  // warn about suspiciously narrow spans
  for (const id of st.servos) {
    const d = w.data[id];
    if (d.min != null && d.max != null && JOINT_OF_ID[id] !== 'wrist_roll') {
      const span = d.max - d.min;
      if (span < 1000) log(t('rangeTooSmall', `ID${id}`, span), 'warn');
    }
  }

  if (allComplete()) saveWizard(true);
}

function allComplete() {
  const w = state.wizard;
  if (!w) return false;
  const st = state.arms[w.arm];
  if (st.servos.length < 6) return false;
  return st.servos.every((id) => {
    const d = w.data[id];
    return d.center != null && d.min != null && d.max != null;
  });
}

async function saveWizard(auto = false) {
  const w = state.wizard;
  if (!w || w.busy) return;
  const st = state.arms[w.arm];
  const incomplete = st.servos.filter((id) => {
    const d = w.data[id];
    return d.center == null || d.min == null || d.max == null;
  });
  if (incomplete.length && !auto) {
    if (!confirm(t('confirmIncomplete', incomplete.map((i) => 'ID' + i).join(', ')))) return;
  }

  w.busy = true;
  setWizardButtons();
  try {
    const data = buildCalibrationData(w.data);
    // write offsets and limits back to the servos
    const failed = [];
    for (const id of st.servos) {
      const name = JOINT_OF_ID[id];
      const j = data[name];
      if (!j) continue;
      try {
        await writeEeprom(st.link, id, REG.OFS, encodeHomingOffset(j.homing_offset));
        await writeEeprom(st.link, id, REG.MIN_LIMIT, j.range_min);
        await writeEeprom(st.link, id, REG.MAX_LIMIT, j.range_max);
      } catch (e) {
        failed.push(`ID${id}: ${e.message || e}`);
      }
    }

    const calibId = ($('#wiz-id').value || '').trim() || (w.type === 'leader' ? 'my_leader_arm' : 'my_follower_arm');
    w.id = calibId;
    downloadText(`${calibId}.json`, JSON.stringify(data, null, 4));
    w.saved = true;
    w.savedPath = calibrationPath(w.type, calibId);

    const armLabel = armName(w.arm);
    log(t('saved', armLabel, `${calibId}.json`, calibId) + ` → ${w.savedPath}` + (auto ? ` — ${t('autoSaved')}` : ''));
    if (failed.length) log(t('writeFailed', failed.join('; ')), 'error');
    showSaveResult(w, auto);
  } finally {
    w.busy = false;
    setWizardButtons();
  }
}

function showSaveResult(w, auto) {
  const hint = $('#wiz-hint');
  const name = `${w.id}.json`;
  hint.innerHTML = `
    <div class="save-result">
      <div class="save-title">✅ ${t('savedTitle')}${auto ? ' · ' + t('autoSaved') : ''}：<b>${escapeHtml(name)}</b></div>
      <div class="save-label">${t('needAt')}</div>
      <div class="save-path">
        <code>${escapeHtml(w.savedPath)}</code>
        <button class="small" id="copy-path">${t('copyPath')}</button>
      </div>
      <div class="save-note">${t('downloadsNote')}</div>
    </div>`;
  const btn = $('#copy-path');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(w.savedPath);
        btn.textContent = t('copied');
        setTimeout(() => { btn.textContent = t('copyPath'); }, 1500);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(hint.querySelector('code'));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }
  hint.scrollIntoView({ block: 'nearest' });
}

function closeWizard() {
  const w = state.wizard;
  if (!w) return;
  const hasProgress = Object.values(w.data).some((d) => d.center != null);
  if (hasProgress && !w.saved && !confirm(t('discardConfirm'))) return;
  $('#wizard').close();
  state.wizard = null;
  ui.wiz = null;
}

/* ------------------------------------------------------------------ */
/* FT debugger                                                         */
/* ------------------------------------------------------------------ */

function ftLink() {
  return state.arms[state.ft.arm];
}

function refreshFtServoSelect() {
  const sel = $('#ft-servo');
  const st = ftLink();
  sel.innerHTML = '';
  for (const id of st.servos) {
    const opt = document.createElement('option');
    opt.value = String(id);
    opt.textContent = `ID${id}`;
    sel.appendChild(opt);
  }
  if (st.servos.length) {
    if (!st.servos.includes(Number(state.ft.servo))) state.ft.servo = st.servos[0];
    sel.value = String(state.ft.servo);
  } else {
    state.ft.servo = null;
  }
}

async function ftReadAll() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  const id = state.ft.servo;
  const regs = {};
  for (const [start, len] of [[0, 16], [16, 16], [32, 17]]) {
    const d = await st.link.read(id, start, len, 400);
    if (d) d.forEach((v, i) => { regs[start + i] = v; });
  }
  state.ft.regs = regs;
  renderFtTable();
  log(`${t('okRead')} ID${id}`);
}

function renderFtTable() {
  const body = $('#ft-table-body');
  body.innerHTML = '';
  ui.ftRows = {};
  const regs = state.ft.regs;
  for (const [addr, len, name, area, access] of REGISTERS) {
    let value = '';
    if (len === 1 && regs[addr] != null) value = String(regs[addr]);
    else if (len === 2 && regs[addr] != null && regs[addr + 1] != null) value = String(to16(regs[addr], regs[addr + 1]));
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${addr}</td><td>${name}</td><td>${len}</td><td>${area}</td><td class="num">${value}</td>`;
    tr.addEventListener('click', () => {
      $$('#ft-table-body tr').forEach((r) => r.classList.remove('selected'));
      tr.classList.add('selected');
      $('#ft-addr').value = addr;
      $('#ft-len').value = len;
      const v = len === 2 ? to16(regs[addr] ?? 0, regs[addr + 1] ?? 0) : (regs[addr] ?? 0);
      $('#ft-val').value = String(v);
    });
    body.appendChild(tr);
  }
}

async function ftReadOne() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  const addr = Number($('#ft-addr').value);
  const len = Math.max(1, Math.min(32, Number($('#ft-len').value)));
  const d = await st.link.read(state.ft.servo, addr, len, 400);
  if (!d) { log(t('readFailed'), 'error'); return; }
  const v = d.reduce((acc, b, i) => acc | (b << (8 * i)), 0);
  $('#ft-val').value = String(v >>> 0);
  log(`${t('okRead')}: ${addr} = ${v >>> 0}`);
  await ftReadAll();
}

async function ftWriteOne() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  const addr = Number($('#ft-addr').value);
  const len = Math.max(1, Math.min(32, Number($('#ft-len').value)));
  const value = Number($('#ft-val').value) >>> 0;
  const data = [];
  for (let i = 0; i < len; i++) data.push((value >>> (8 * i)) & 0xFF);
  try {
    if (addr >= 0 && addr <= 48) await writeEeprom(st.link, state.ft.servo, addr, value, len);
    else await st.link.write(state.ft.servo, addr, data);
    log(t('okWrite', addr, value >>> 0));
    await sleep(60);
    await ftReadAll();
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  }
}

async function ftMove() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  const pos = clampPos($('#ft-pos').value);
  $('#ft-pos').value = pos;
  $('#ft-pos-range').value = pos;
  await st.link.write(state.ft.servo, REG.TORQUE, [1]);
  await sleep(20);
  await st.link.write(state.ft.servo, REG.GOAL_POS, le16(pos));
  log(`ID${state.ft.servo} → ${pos}`);
}

async function ftApplyBaud() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  if (st.link.isMock) { log(t('mockNotice'), 'warn'); return; }
  const code = Number($('#ft-baud').value);
  const baud = BAUD_TABLE[code];
  if (!confirm(t('baudConfirm', baud))) return;
  try {
    await writeEeprom(st.link, state.ft.servo, REG.BAUD, code, 1);
    const oldPort = st.link.port;
    const id = state.ft.servo;
    await st.link.close();
    await sleep(300);
    const link = new SerialLink(oldPort, baud, state.ft.arm);
    await link.open();
    st.link = link;
    await sleep(200);
    const ok = await link.ping(id);
    if (!ok) throw new Error('ping failed');
    log(t('baudDone', baud));
  } catch (e) {
    log(t('baudFailed', e.message || e), 'error');
  }
}

async function ftFactoryReset() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  if (st.link.isMock) { log(t('mockNotice'), 'warn'); return; }
  if (!confirm(t('confirmFactory'))) return;
  const id = state.ft.servo;
  try {
    await writeEeprom(st.link, id, REG.ID, 1, 1);
    await writeEeprom(st.link, id, REG.BAUD, 0, 1);
    const oldPort = st.link.port;
    await st.link.close();
    await sleep(300);
    const link = new SerialLink(oldPort, 1000000, state.ft.arm);
    await link.open();
    st.link = link;
    state.ft.servo = 1;
    st.servos = await scanArm(state.ft.arm);
    refreshFtServoSelect();
    log(t('factoryDone'));
  } catch (e) {
    log(t('writeFailed', e.message || e), 'error');
  }
}

async function xdatSave() {
  const st = ftLink();
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  const data = new Uint8Array(XDAT_DATA_LEN);
  for (const [addr, len, , area] of REGISTERS) {
    if (area === 'DEFAULT' || addr + len > 48) continue;
    const d = await st.link.read(state.ft.servo, addr, len, 300);
    if (!d) continue;
    for (let i = 0; i < len; i++) data[addr + i] = d[i];
  }
  const bytes = buildXdat(data);
  downloadBytes(`servo_${state.ft.servo}.xdat`, bytes);
  log(t('xdatSaved'));
}

async function xdatApply() {
  const st = ftLink();
  if (!state.ft.xdat) return;
  if (!st.link?.connected || !state.ft.servo) { log(t('noPort'), 'warn'); return; }
  if (!confirm(t('xdatApplyConfirm', state.ft.servo))) return;
  const data = state.ft.xdat.data;
  let written = 0;
  for (const [addr, len, , area] of REGISTERS) {
    if (area === 'DEFAULT' || addr + len > data.length) continue;
    let v = 0;
    for (let i = 0; i < len; i++) v |= data[addr + i] << (8 * i);
    try {
      if (area === 'EEPROM') await writeEeprom(st.link, state.ft.servo, addr, v, len, false);
      else await st.link.write(state.ft.servo, addr, Array.from(data.slice(addr, addr + len)));
      written += 1;
    } catch { /* keep going */ }
  }
  log(t('xdatApplied', written));
  await ftReadAll();
}

/* ------------------------------------------------------------------ */
/* wiring                                                              */
/* ------------------------------------------------------------------ */

function wire() {
  $('#btn-connect-leader').addEventListener('click', () => connectArm('leader'));
  $('#btn-connect-follower').addEventListener('click', () => connectArm('follower'));
  $('#mock-mode').addEventListener('change', (e) => { state.mock = e.target.checked; });
  $('#btn-lang').addEventListener('click', () => { toggleLang(); applyI18n(); });
  $('#btn-remote').addEventListener('click', toggleRemote);
  $('#btn-clear-log').addEventListener('click', () => { $('#log').innerHTML = ''; });

  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((x) => x.classList.remove('active'));
      $$('.panel').forEach((x) => x.classList.remove('active'));
      tab.classList.add('active');
      $(`#panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  $$('[data-action="middle-calib"]').forEach((b) => b.addEventListener('click', () => openWizard(b.dataset.arm)));
  $$('[data-action="middle-test"]').forEach((b) => b.addEventListener('click', () => middleTest(b.dataset.arm)));
  $$('[data-action="disable"]').forEach((b) => b.addEventListener('click', () => disableMotors(b.dataset.arm)));

  $('#wizard-close').addEventListener('click', closeWizard);
  $('#wizard').addEventListener('cancel', (e) => { e.preventDefault(); closeWizard(); });
  $('#wiz-center').addEventListener('click', () => {
    const w = state.wizard;
    if (!w) return;
    if (w.centerRec) finishCenterRecording(); else startCenterRecording();
  });
  $('#wiz-range').addEventListener('click', () => {
    const w = state.wizard;
    if (!w) return;
    if (w.rangeRec) stopRangeRecording(); else startRangeRecording();
  });
  $('#wiz-save').addEventListener('click', () => saveWizard(false));

  $('#ft-arm').addEventListener('change', (e) => {
    state.ft.arm = e.target.value;
    state.ft.regs = {};
    refreshFtServoSelect();
    renderFtTable();
  });
  $('#ft-connect').addEventListener('click', () => {
    const arm = state.ft.arm;
    if (state.arms[arm].link?.connected) log(t('alreadyConnected'), 'warn');
    else connectArm(arm);
  });
  $('#ft-scan').addEventListener('click', async () => {
    const st = ftLink();
    if (!st.link?.connected) { log(t('noPort'), 'warn'); return; }
    st.servos = await scanArm(state.ft.arm);
    refreshFtServoSelect();
    log(t('scanDone', st.servos.join(', ')));
  });
  $('#ft-servo').addEventListener('change', (e) => { state.ft.servo = Number(e.target.value); });
  $('#ft-read-all').addEventListener('click', ftReadAll);
  $('#ft-read').addEventListener('click', ftReadOne);
  $('#ft-write').addEventListener('click', ftWriteOne);
  $('#ft-move').addEventListener('click', ftMove);
  $('#ft-pos-range').addEventListener('input', (e) => { $('#ft-pos').value = e.target.value; });
  $('#ft-pos').addEventListener('change', (e) => { $('#ft-pos-range').value = clampPos(e.target.value); });
  $('#ft-baud-apply').addEventListener('click', ftApplyBaud);
  $('#ft-factory').addEventListener('click', ftFactoryReset);
  $('#xdat-save').addEventListener('click', xdatSave);
  $('#xdat-open').addEventListener('click', () => $('#xdat-file').click());
  $('#xdat-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      state.ft.xdat = parseXdat(buf);
      state.ft.xdatName = file.name;
      $('#xdat-name').textContent = file.name;
      $('#xdat-apply').disabled = false;
      log(t('xdatLoaded', file.name));
    } catch (err) {
      log(t('xdatBad'), 'error');
    }
  });
  $('#xdat-apply').addEventListener('click', xdatApply);
}

/* ------------------------------------------------------------------ */
/* boot                                                                */
/* ------------------------------------------------------------------ */

function boot() {
  setLang(getLang());
  if (!SerialLink.supported()) {
    const banner = $('#env-banner');
    banner.textContent = t('noSerial');
    banner.classList.remove('hidden');
  }
  wire();
  applyI18n();
  pollLoop();
  log(t('appTitle') + ' — ' + t('appSub'));
}

boot();

// Debug handle: the demo-mode smoke test uses it, and it is handy in the console.
window.__soarm = {
  state,
  showSaveResult,
  mockMove(arm, id, pos) {
    const link = state.arms[arm]?.link;
    if (!link?.isMock) return false;
    const s = link.servos.get(Number(id));
    if (!s) return false;
    s.torque = true;
    s.goal = Number(pos);
    s.pos = Number(pos);
    return true;
  },
};
