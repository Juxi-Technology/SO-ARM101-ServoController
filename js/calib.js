/** Calibration math and file formats (ported from src/calibration_math.py and src/xdat_utils.py). */

export const MAX_RES = 4095;
export const HALF_TURN = MAX_RES >> 1; // 2047

export const JOINT_NAMES = [
  'shoulder_pan', 'shoulder_lift', 'elbow_flex',
  'wrist_flex', 'wrist_roll', 'gripper',
];
export const JOINT_OF_ID = Object.fromEntries(JOINT_NAMES.map((n, i) => [i + 1, n]));
export const CONTINUOUS_JOINTS = new Set(['wrist_roll']);

/** Raw middle position -> LeRobot homing_offset delta. Clamps 4095 to 4094. */
export function homingOffsetFromPosition(pos) {
  const p = Math.min(Math.max(Math.round(pos), 0), MAX_RES - 1);
  return p - HALF_TURN;
}

/** Sign-magnitude encoding of register 31 (sign bit 11) — matches LeRobot. */
export function encodeHomingOffset(offset) {
  const off = Math.trunc(offset);
  if (Math.abs(off) > HALF_TURN) throw new Error(`homing_offset ${off} out of range ±${HALF_TURN}`);
  return off < 0 ? (0x800 | (-off)) : off;
}

export function decodeHomingOffset(encoded) {
  const v = encoded & 0xFFF;
  return (v & 0x800) ? -(v & 0x7FF) : (v & 0x7FF);
}

/**
 * Build the LeRobot JSON payload.
 * state: { [servoId]: {center, min, max} } where center is the raw position shown in the table.
 */
export function buildCalibrationData(state) {
  const data = {};
  for (const [idStr, st] of Object.entries(state)) {
    const id = Number(idStr);
    const name = JOINT_OF_ID[id];
    if (!name) continue;
    data[name] = {
      id,
      drive_mode: 0,
      homing_offset: st.center == null ? 0 : homingOffsetFromPosition(st.center),
      range_min: st.min == null ? 0 : st.min,
      range_max: st.max == null ? MAX_RES : st.max,
    };
  }
  return data;
}

export function calibrationPath(armType, calibId) {
  // Only informational: browsers cannot write into the LeRobot cache directly.
  return armType === 'leader'
    ? `~/.cache/huggingface/lerobot/calibration/teleoperators/so_leader/${calibId}.json`
    : `~/.cache/huggingface/lerobot/calibration/robots/so_follower/${calibId}.json`;
}

export function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadBytes(filename, bytes, mime = 'application/octet-stream') {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------------- xdat (flat memory map: [00 28] + 49 data bytes) ---------------- */

export const XDAT_HEADER = [0x00, 0x28];
export const XDAT_DATA_LEN = 49;

export function parseXdat(buffer) {
  const bytes = new Uint8Array(buffer);
  const header = bytes.length >= 2 ? bytes.slice(0, 2) : Uint8Array.from(XDAT_HEADER);
  const data = bytes.length > 2 ? bytes.slice(2) : new Uint8Array(0);
  return { header, data };
}

export function buildXdat(data) {
  const out = new Uint8Array(2 + data.length);
  out[0] = XDAT_HEADER[0];
  out[1] = XDAT_HEADER[1];
  out.set(data, 2);
  return out;
}
