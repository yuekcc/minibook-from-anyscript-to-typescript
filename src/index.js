import { setResizeHandler } from './resize';
import INDEX_TPL from './theme/index.template.html?raw';
import { renderToc, scrollIntoView } from './util';

import './styles';

const $ = document.querySelector.bind(document);

function fetchText(url) {
  return fetch(url).then(resp => {
    if (resp.ok) {
      return resp.text();
    }

    return Promise.resolve('');
  });
}

async function renderPost(url, defaultResult = 'not found or render markdown failed') {
  const _defaultResult = {
    html: defaultResult,
    headings: [],
  };

  try {
    const text = await fetchText(url);
    if (!text) {
      return _defaultResult;
    }

    return import('./md').then(m => m.renderMarkdown(text));
  } catch {
    return _defaultResult;
  }
}

class MarkdownNotes {
  constructor(config) {
    this._initFrames();

    this._config = config;
    this._lifeCycleHooks = {};
    this.$sidebar = $('#sidebar');
    this.$post = $('#content');
    this.$menuSwitch = $('.sidebar-control');
    this.$siteName = $('.site-name');
    this.$permalink = $('.permalink');
    this.$backToTop = $('.back-to-top');
    this.$backToTopButton = $('.back-to-top');
    this.$sidebarResizeHandler = $('.sidebar-resize-handler');

    this._menuIsShowing = false;

    this.$backToTopButton.addEventListener('click', this._goBackToTop.bind(this));
    window.addEventListener('popstate', this._renderSidebarAndContent.bind(this));

    setResizeHandler(this.$sidebarResizeHandler);
  }

  _goBackToTop() {
    if (this.$post?.parentElement) {
      this.$post.parentElement.scrollTop = 0;
    }
  }

  _renderSidebarAndContent() {
    const [postPath, queryParams] = location.hash.split('?');
    this._renderContent(postPath);
    this._renderBackToTop();

    let sidebarFileName = '/SIDEBAR.md';
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      const name = params.get('sidebar');
      sidebarFileName = name || sidebarFileName;
    }

    this._renderSidebar(sidebarFileName);
  }

  _renderBackToTop() {
    this.$backToTop.classList.add('visible');
  }

  _renderSidebar(sidebarFileName = '/SIDEBAR.md') {
    return renderPost(sidebarFileName, '').then(({ html }) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const currentHost = location.host;

      dom.querySelectorAll('a').forEach(it => {
        const url = new URL(it.href);

        // host 与当前页面不一致的，属于外部连接，保持原样
        if (url.host !== currentHost) {
          it.setAttribute('target', '_blank');
          return;
        }

        // 渲染侧栏时，自动加上 sidebar 参数
        if (!url.searchParams.has('sidebar')) {
          url.searchParams.set('sidebar', sidebarFileName);
        }

        const basePath = this._config.basePath || '/';

        const hash = `${basePath}#${url.pathname}?${url.searchParams}`;
        it.setAttribute('href', hash);
      });

      this.$sidebar.innerHTML = dom.body.innerHTML;
    });
  }

  _renderCustomContent() {
    const { siteName } = this._config || {};
    if (siteName) {
      document.title = siteName || '';
    }

    this.$siteName.textContent = siteName || '';
  }

  async _renderContent(hash = '') {
    const url = hash.startsWith('#') ? hash.slice(1) : hash;

    const { html, headings } = await renderPost(url || 'README.md');

    this.$post.innerHTML = html;
    this.$permalink.textContent = `原文连接：${location.href}`;
    this._emit('rendered');

    // 渲染文章后，回到顶部
    // this._goBackToTop();

    setTimeout(() => {
      const $toc = document.querySelector('#toc');
      if (!$toc) {
        return;
      }

      const tocHtml = renderToc(headings);
      $toc.innerHTML = tocHtml;

      $toc.addEventListener('click', e => {
        const { target } = e;
        const headerId = target.dataset.headerId;
        if (!headerId) {
          return;
        }

        const el = document.getElementById(headerId.toLowerCase());
        scrollIntoView(el);
      });
    }, 0);
  }

  _emit(name) {
    const hooks = this._lifeCycleHooks[name] || [];
    setTimeout(() => hooks.forEach(it => it && typeof it === 'function' && it()), 0);
  }

  listen(name, fn) {
    if (!Array.isArray(this._lifeCycleHooks[name])) {
      this._lifeCycleHooks[name] = [];
    }

    this._lifeCycleHooks[name].push(fn);
  }

  _initFrames() {
    const frame = document.createElement('template');
    frame.innerHTML = INDEX_TPL;
    document.body.append(frame.content);
  }

  render() {
    this._renderSidebarAndContent();
    this._renderCustomContent();
  }
}

const notes = new MarkdownNotes(window.marknoteConfig);
notes.listen('rendered', () => {
  import('highlight.js').then(m => {
    m.default.highlightAll();
  });
});

notes.render();
