/**
 * Feetech STS3215 (protocol 0) over the Web Serial API.
 *
 * Packet layout:  FF FF <id> <len> <instr> <params...> <checksum>
 * Status packet:  FF FF <id> <len> <error> <params...> <checksum>
 * checksum = ~(sum of bytes from id to the last param) & 0xFF
 */

export const INST = { PING: 1, READ: 2, WRITE: 3 };

export const REG = {
  FW_MAJOR: 0, FW_MINOR: 1, MODEL_L: 3, MODEL_H: 4,
  ID: 5, BAUD: 6, RETURN_LEVEL: 8,
  MIN_LIMIT: 9, MAX_LIMIT: 11,
  MAX_TORQUE: 16, PHASE: 18,
  P_COEF: 21, D_COEF: 22, I_COEF: 23,
  OFS: 31, MODE: 33,
  TORQUE: 40, ACC: 41, GOAL_POS: 42, GOAL_TIME: 44, GOAL_SPEED: 46,
  LOCK: 55,
  PRESENT_POS: 56, PRESENT_SPEED: 58, PRESENT_LOAD: 60,
  PRESENT_VOLTAGE: 62, PRESENT_TEMP: 63, MOVING: 66, PRESENT_CURRENT: 69,
};

export const BAUD_TABLE = {
  0: 1000000, 1: 500000, 2: 250000, 3: 128000,
  4: 115200, 5: 76800, 6: 57600, 7: 38400,
};

export const MODEL_NAMES = {
  777: 'STS3215', 521: 'STS3032', 3032: 'STS3032', 3046: 'STS3046',
  15: 'SCS15', 25: 'SCS25', 45: 'SCS45', 115: 'SCS115', 215: 'SCS215',
};

// (address, length, name, area, access) — same table as src/xdat_utils.py
export const REGISTERS = [
  [0, 1, 'Firmware major', 'EEPROM', 'ro'],
  [1, 1, 'Firmware minor', 'EEPROM', 'ro'],
  [3, 1, 'Model major', 'EEPROM', 'ro'],
  [4, 1, 'Model minor', 'EEPROM', 'ro'],
  [5, 1, 'Servo ID', 'EEPROM', 'rw'],
  [6, 1, 'Baud rate', 'EEPROM', 'rw'],
  [7, 1, 'Reserved', 'EEPROM', 'rw'],
  [8, 1, 'Return level', 'EEPROM', 'rw'],
  [9, 2, 'Min angle limit', 'EEPROM', 'rw'],
  [11, 2, 'Max angle limit', 'EEPROM', 'rw'],
  [13, 1, 'Max temperature', 'EEPROM', 'rw'],
  [14, 1, 'Max voltage', 'EEPROM', 'rw'],
  [15, 1, 'Min voltage', 'EEPROM', 'rw'],
  [16, 2, 'Max torque', 'EEPROM', 'rw'],
  [18, 1, 'Phase', 'EEPROM', 'rw'],
  [19, 1, 'Unload condition', 'EEPROM', 'rw'],
  [20, 1, 'LED alarm condition', 'EEPROM', 'rw'],
  [21, 1, 'P coefficient', 'EEPROM', 'rw'],
  [22, 1, 'D coefficient', 'EEPROM', 'rw'],
  [23, 1, 'I coefficient', 'EEPROM', 'rw'],
  [24, 1, 'Min startup force', 'EEPROM', 'rw'],
  [25, 1, 'Integral limit', 'EEPROM', 'rw'],
  [26, 1, 'CW dead zone', 'EEPROM', 'rw'],
  [27, 1, 'CCW dead zone', 'EEPROM', 'rw'],
  [28, 2, 'Protection current', 'EEPROM', 'rw'],
  [30, 1, 'Angle resolution', 'EEPROM', 'rw'],
  [31, 2, 'Homing offset', 'EEPROM', 'rw'],
  [33, 1, 'Operating mode', 'EEPROM', 'rw'],
  [34, 1, 'Protection torque', 'EEPROM', 'rw'],
  [35, 1, 'Protection time', 'EEPROM', 'rw'],
  [36, 1, 'Overload torque', 'EEPROM', 'rw'],
  [37, 1, 'Speed loop P', 'EEPROM', 'rw'],
  [38, 1, 'Overcurrent time', 'EEPROM', 'rw'],
  [39, 1, 'Speed loop I', 'EEPROM', 'rw'],
  [40, 1, 'Torque enable', 'SRAM', 'rw'],
  [41, 1, 'Acceleration', 'SRAM', 'rw'],
  [42, 2, 'Goal position', 'SRAM', 'rw'],
  [44, 2, 'PWM speed', 'SRAM', 'rw'],
  [46, 2, 'Goal speed', 'SRAM', 'rw'],
  [48, 2, 'Torque limit', 'SRAM', 'rw'],
  [55, 1, 'Lock', 'SRAM', 'rw'],
  [56, 2, 'Present position', 'SRAM', 'ro'],
  [58, 2, 'Present speed', 'SRAM', 'ro'],
  [60, 2, 'Present load', 'SRAM', 'ro'],
  [62, 1, 'Voltage', 'SRAM', 'ro'],
  [63, 1, 'Temperature', 'SRAM', 'ro'],
  [64, 1, 'Async write flag', 'SRAM', 'ro'],
  [65, 1, 'Servo status', 'SRAM', 'ro'],
  [66, 1, 'Moving', 'SRAM', 'ro'],
  [69, 2, 'Current', 'SRAM', 'ro'],
  [80, 1, 'Moving threshold', 'DEFAULT', 'def'],
  [81, 1, 'DTS (ms)', 'DEFAULT', 'def'],
  [82, 1, 'Speed unit factor', 'DEFAULT', 'def'],
  [83, 1, 'Min speed limit', 'DEFAULT', 'def'],
  [84, 1, 'Max speed limit', 'DEFAULT', 'def'],
  [85, 1, 'Acceleration limit', 'DEFAULT', 'def'],
  [86, 1, 'Acceleration factor', 'DEFAULT', 'def'],
];

export function buildPacket(id, instr, params = []) {
  const len = params.length + 2;
  const out = [0xFF, 0xFF, id, len, instr, ...params];
  let sum = 0;
  for (let i = 2; i < out.length; i++) sum += out[i];
  out.push(~sum & 0xFF);
  return Uint8Array.from(out);
}

export function le16(v) { return [v & 0xFF, (v >> 8) & 0xFF]; }
export function to16(lo, hi) { return (lo & 0xFF) | ((hi & 0xFF) << 8); }
export function toSigned(v, bits = 16) {
  const half = 1 << (bits - 1);
  return (v & (half - 1)) - (v & half ? half * 2 : 0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Shared behaviour for real and simulated links. */
class BaseLink {
  constructor(label = '') {
    this.label = label;
    this.isMock = false;
    this.connected = false;
  }
  async ping() { throw new Error('not implemented'); }
  async read() { throw new Error('not implemented'); }
  async write() { throw new Error('not implemented'); }
  async close() { this.connected = false; }
}

/**
 * Real serial link. All transactions are serialised: the Web Serial stream is
 * shared by the polling loop and by user actions, and interleaving them would
 * swap the reply packets (same problem the desktop app solves with a lock).
 */
export class SerialLink extends BaseLink {
  constructor(port, baud = 1000000, label = '') {
    super(label);
    this.port = port;
    this.baud = baud;
    this.buf = [];
    this.chain = Promise.resolve();
    this._signal = null;
    this._reader = null;
    this._closed = false;
  }

  static supported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /** Must be called from a user gesture (button click). */
  static async request(baud = 1000000, label = '') {
    if (!SerialLink.supported()) {
      throw new Error('Web Serial is not available in this browser (use Chrome/Edge over HTTPS).');
    }
    const port = await navigator.serial.requestPort();
    const link = new SerialLink(port, baud, label);
    await link.open();
    return link;
  }

  /** Ports the user has already granted, without a picker. */
  static async grantedPorts() {
    if (!SerialLink.supported()) return [];
    try { return await navigator.serial.getPorts(); } catch { return []; }
  }

  async open() {
    await this.port.open({
      baudRate: this.baud,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 4096,
    });
    this.connected = true;
    this._pump();
  }

  async _pump() {
    try {
      this._reader = this.port.readable.getReader();
      while (!this._closed) {
        const { value, done } = await this._reader.read();
        if (done) break;
        if (value && value.length) {
          for (const b of value) this.buf.push(b);
          this._wake();
        }
      }
    } catch (e) {
      this.error = e;
    }
    this._wake();
  }

  _wake() {
    const fn = this._signal;
    this._signal = null;
    if (fn) fn();
  }

  _nextData(ms = 20) {
    return new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      this._signal = () => { clearTimeout(t); resolve(); };
    });
  }

  async _locked(fn) {
    const prev = this.chain;
    let release;
    this.chain = new Promise((r) => { release = r; });
    await prev;
    try { return await fn(); } finally { release(); }
  }

  _takeFrame(id, timeout = 400) {
    const deadline = Date.now() + timeout;
    return (async () => {
      while (Date.now() < deadline) {
        // drop leading garbage until a header is possible
        while (this.buf.length >= 2 && !(this.buf[0] === 0xFF && this.buf[1] === 0xFF)) {
          this.buf.shift();
        }
        if (this.buf.length >= 4) {
          const total = this.buf[3] + 4;
          if (total >= 6 && this.buf.length >= total) {
            const frame = this.buf.slice(0, total);
            let sum = 0;
            for (let i = 2; i < total - 1; i++) sum += frame[i];
            const ok = ((~sum) & 0xFF) === frame[total - 1];
            this.buf.splice(0, total);
            if (!ok) continue;
            if (id === null || frame[2] === id) {
              return { id: frame[2], error: frame[4], params: frame.slice(5, total - 1) };
            }
            continue; // stale reply for another id
          }
        }
        if (this.error) throw this.error;
        await this._nextData(20);
      }
      return null;
    })();
  }

  async _transact(packet, expectId, timeout) {
    return this._locked(async () => {
      if (!this.connected) throw new Error('serial port is not open');
      const writer = this.port.writable.getWriter();
      try {
        await writer.write(packet);
      } finally {
        writer.releaseLock();
      }
      return this._takeFrame(expectId, timeout);
    });
  }

  async ping(id) {
    const f = await this._transact(buildPacket(id, INST.PING), id, 200);
    return !!f;
  }

  async read(id, address, length, timeout = 400) {
    const f = await this._transact(buildPacket(id, INST.READ, [address & 0xFF, length & 0xFF]), id, timeout);
    if (!f || f.params.length < length) return null;
    return f.params.slice(0, length);
  }

  async write(id, address, data, timeout = 400) {
    const f = await this._transact(buildPacket(id, INST.WRITE, [address & 0xFF, ...data]), id, timeout);
    return !!f;
  }

  async close() {
    this._closed = true;
    this._wake();
    try { if (this._reader) await this._reader.cancel(); } catch { /* ignore */ }
    try { this._reader = null; } catch { /* ignore */ }
    try { await sleep(20); await this.port.close(); } catch { /* ignore */ }
    this.connected = false;
  }
}

/**
 * Simulated bus for the "demo" mode: same read/write interface, six servos with
 * plausible registers. Lets the whole UI (including the calibration wizard) run
 * without hardware.
 */
export class MockLink extends BaseLink {
  constructor(label = '') {
    super(label);
    this.isMock = true;
    this.connected = true;
    this.servos = new Map();
    for (let id = 1; id <= 6; id++) {
      const regs = new Uint8Array(128);
      regs[REG.FW_MAJOR] = 3;
      regs[REG.FW_MINOR] = 10;
      regs[REG.MODEL_L] = 777 & 0xFF;
      regs[REG.MODEL_H] = (777 >> 8) & 0xFF;
      regs[REG.ID] = id;
      regs[REG.BAUD] = 0;
      regs[REG.MIN_LIMIT] = 0;
      regs[REG.MIN_LIMIT + 1] = 0;
      regs[REG.MAX_LIMIT] = 0xFF;
      regs[REG.MAX_LIMIT + 1] = 0x0F;
      regs[REG.TORQUE] = 0;
      this.servos.set(id, { regs, pos: 2048, goal: 2048, torque: false, speed: 0 });
    }
    this._timer = setInterval(() => this._tick(), 30);
  }

  _tick() {
    for (const s of this.servos.values()) {
      const diff = s.goal - s.pos;
      if (s.torque && Math.abs(diff) > 1) {
        const step = Math.sign(diff) * Math.min(Math.abs(diff), 40);
        s.pos += step;
        s.speed = step;
      } else {
        s.speed = 0;
      }
      const lo = to16(s.regs[REG.MIN_LIMIT], s.regs[REG.MIN_LIMIT + 1]);
      const hi = to16(s.regs[REG.MAX_LIMIT], s.regs[REG.MAX_LIMIT + 1]);
      const clamped = Math.max(lo, Math.min(hi, s.pos));
      // register 31 is sign-magnitude (sign bit 11), not two's complement
      const enc = to16(s.regs[REG.OFS], s.regs[REG.OFS + 1]);
      const ofs = (enc & 0x800) ? -(enc & 0x7FF) : (enc & 0x7FF);
      const present = ((clamped - ofs) % 4096 + 4096) % 4096;
      s.regs[REG.PRESENT_POS] = present & 0xFF;
      s.regs[REG.PRESENT_POS + 1] = (present >> 8) & 0xFF;
      s.regs[REG.PRESENT_SPEED] = s.speed & 0xFF;
      s.regs[REG.PRESENT_SPEED + 1] = 0;
      s.regs[REG.PRESENT_LOAD] = 0;
      s.regs[REG.PRESENT_LOAD + 1] = 0;
      s.regs[REG.PRESENT_VOLTAGE] = 50; // 5.0 V
      s.regs[REG.PRESENT_TEMP] = 32;
      s.regs[REG.PRESENT_CURRENT] = 20;
      s.regs[REG.MOVING] = Math.abs(diff) > 1 && s.torque ? 1 : 0;
      s.regs[REG.LOCK] = 1;
    }
  }

  async ping(id) { await sleep(3); return this.servos.has(id); }

  async read(id, address, length) {
    await sleep(3);
    const s = this.servos.get(id);
    if (!s) return null;
    return Array.from(s.regs.slice(address, address + length));
  }

  async write(id, address, data) {
    await sleep(3);
    const s = this.servos.get(id);
    if (!s) return false;
    data.forEach((v, i) => { if (address + i < s.regs.length) s.regs[address + i] = v & 0xFF; });
    if (address === REG.TORQUE && data.length === 1) {
      if (data[0] === 128) {
        // "set current position as middle": store the offset so it reads 2048
        const v = ((s.pos - 2048) % 4096 + 4096) % 4096;
        const ofs = v >= 2048 ? v - 4096 : v;
        const enc = ofs < 0 ? (0x800 | -ofs) : ofs;
        s.regs[REG.OFS] = enc & 0xFF;
        s.regs[REG.OFS + 1] = (enc >> 8) & 0xFF;
      }
      s.torque = data[0] === 1;
    }
    if (address === REG.GOAL_POS && data.length === 2) {
      s.goal = to16(data[0], data[1]);
    }
    // a WritePosEx-style block starts at ACC and carries the goal at index 1..2
    const goalIdx = REG.GOAL_POS - address;
    if (goalIdx >= 0 && goalIdx + 1 < data.length && address !== REG.GOAL_POS) {
      s.goal = to16(data[goalIdx], data[goalIdx + 1]);
    }
    return true;
  }

  async close() { clearInterval(this._timer); this.connected = false; }
}
