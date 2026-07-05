// history.js — Ngăn xếp Undo/Redo dựa trên ảnh chụp trạng thái (snapshot).
export class History {
  constructor(limit = 100) {
    this.limit = limit;
    this.past = [];
    this.future = [];
    this.onChange = null;
  }

  // Ghi lại một ảnh chụp trạng thái (chuỗi JSON đã tuần tự hóa)
  push(snapshot) {
    this.past.push(snapshot);
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0;
    this._notify();
  }

  canUndo() { return this.past.length > 1; }
  canRedo() { return this.future.length > 0; }

  undo() {
    if (!this.canUndo()) return null;
    const current = this.past.pop();
    this.future.push(current);
    this._notify();
    return this.past[this.past.length - 1];
  }

  redo() {
    if (!this.canRedo()) return null;
    const snap = this.future.pop();
    this.past.push(snap);
    this._notify();
    return snap;
  }

  reset(snapshot) {
    this.past = [snapshot];
    this.future = [];
    this._notify();
  }

  _notify() { if (this.onChange) this.onChange(); }
}
