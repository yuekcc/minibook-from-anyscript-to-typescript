class Resize {
  _el: HTMLDivElement;
  _resize: (e: MouseEvent) => void;
  _stopResize: (e: MouseEvent) => void;
  _listen: Array<(width: number) => void> = [];

  constructor(el: HTMLDivElement) {
    this._el = el;

    this._resize = e => {
      let width = e.clientX;
      width = Math.max(100, Math.floor(width));
      this._emit(width);
    };

    this._stopResize = () => {
      document.body.onmousemove = null;
      document.body.onmouseup = null;
      document.documentElement.classList.remove('sidebar-resizing');
    };

    this._el.onmousedown = this._initResize.bind(this);
  }

  _emit(width: number) {
    this._listen.forEach(fn => fn(width));
  }

  _initResize() {
    document.body.onmousemove = this._resize.bind(this);
    document.body.onmouseup = this._stopResize.bind(this);

    document.documentElement.classList.add('sidebar-resizing');
  }

  listen(fn: (width: number) => void) {
    if (!this._listen.includes(fn)) {
      this._listen.push(fn);
    }
  }
}

export function setResizeHandler(el: HTMLDivElement) {
  const resizing = new Resize(el);
  resizing.listen(width => {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
  });
}
