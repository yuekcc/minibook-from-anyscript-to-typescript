/**
 * 生成一个 HASH 字符串
 * @param {string} str
 * @returns {string}
 */
function _hash(str) {
  if (!str || typeof str !== 'string') return 0;
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = ((result << 5) - result + str.charCodeAt(i)) | 0;
    result = result & result;
  }
  return result;
}

/**
 * 生成ID
 * @param {string} str
 * @returns {string}
 */
export function makeId(str) {
  return `hash-${_hash(str)}`;
}

/**
 * 设置 el 的 innerHTML
 * @param {HTMLDivElement} el
 * @param {string} html
 * @returns {void}
 */
export function updateInnerHtml(el, html) {
  if (el) {
    el.innerHTML = html || '';
  }
}

export function scrollIntoView(el, options = {}) {
  el?.scrollIntoView({ block: 'start', ...options });
}

/**
 *  将 heading 数据，重构为树结构
 *
 * 原来是平铺的结果，改为将子节点卷上最近的父节点
 * 比如有 levels 的平铺数据：1 2 3 3 3 3 2 2 2 => {level: 1, children: [ { level: 2, children: [3 3 3 3 3]}, {level: 2}, {level: 2}]}
 *
 * @template {import('./types').Heading} T
 * @param {T[]} headings
 * @returns {T[]}
 */
function toHeadingTree(headings) {
  const root = {
    depth: 0,
    children: [],
  };

  const visited = [root];
  function top() {
    return visited[visited.length - 1];
  }

  let i = 0;
  while (i < headings.length) {
    const parent = top();
    const cur = headings[i];

    if (parent.depth < cur.depth) {
      parent.children.push(cur);
      visited.push(cur);
      i++;
      continue;
    }

    if (parent.depth >= cur.depth) {
      visited.pop();
      continue;
    }

    i++;
  }

  return root.children;
}

/**
 *
 * @template {import('./types').Heading} T
 * @param {T[]} headings
 * @returns {string}
 */
export function renderToc(headings) {
  function buildHtml(headings) {
    const inner = headings.map(heading => {
      let subLevelHtml = '';
      if (heading.children.length > 0) {
        subLevelHtml = buildHtml(heading.children);
      }
      return [
        '<li>',
        `<a class="toc-header level-${heading.level} clickable" data-header-id="${heading.id}" href="javascript:void(0)">${heading.text}</a>`,
        subLevelHtml,
        '</li>',
      ].join('');
    });

    return `<ul>${inner.join('\n')}</ul>`;
  }

  const _headings = toHeadingTree(headings);
  return `<h2>目录</h2>${buildHtml(_headings)}`;
}
