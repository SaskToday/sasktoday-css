/**
 * SaskToday — Sponsored RSS sidebar inject (Zapier-hosted feed)
 *
 * Fetches city-specific Zapier RSS feeds so Village Media is only polled by
 * Zapier, not by every page view.
 *
 * Stale-item guard: Zapier feeds are append-only, so after fetch we keep only
 * items that still appear in that city's live Village sponsored RSS. Miscategorized
 * stories that were moved out of sponsored content drop out of the widget.
 *
 * Cities:
 *   /regina-today    → Regina Zapier feed
 *   /yorkton-today   → Yorkton Zapier feed
 *   /saskatoon-today → Saskatoon Zapier feed
 *
 * Injects into .widget-area-col after the first child <div>.
 * Root class is st-sponsored-rss only (never "widget") so Village CMS
 * does not treat this as an editable sidebar widget.
 *
 * If the browser blocks the Zapier feed (CORS), set CONFIG.corsProxyPrefix to:
 *   'https://api.allorigins.win/raw?url='
 */
(function () {
  var CONFIG = {
    // Leave empty first. Only fill this if DevTools shows a CORS error on feedUrl.
    // Example: 'https://api.allorigins.win/raw?url='
    corsProxyPrefix: '',

    maxItems: 3,
    cacheTtlMs: 5 * 60 * 1000,
    injectSelector: '.widget-area-col',
    rootId: 'st-sponsored-rss',
    label: 'Sponsored content',
    moreLabel: 'See more',
    cacheKeyPrefix: 'st-sponsored-rss-zapier:v5:',

    cities: [
      {
        pathIncludes: '/regina-today',
        feedUrl: 'https://zapier.com/engine/rss/27445063/regina-sponsored-content',
        morePath: '/regina-today/regina-sponsored-content/'
      },
      {
        pathIncludes: '/yorkton-today',
        feedUrl: 'https://zapier.com/engine/rss/27445063/yorkton-sponsored-v3',
        morePath: '/yorkton-today/yorkton-sponsored-content/'
      },
      {
        pathIncludes: '/saskatoon-today',
        feedUrl: 'https://zapier.com/engine/rss/27445063/saskatoon-sponsored',
        morePath: '/saskatoon-today/saskatoon-sponsored-content/'
      }
    ]
  };

  function getCity() {
    var path = window.location.pathname;
    var i;
    for (i = 0; i < CONFIG.cities.length; i++) {
      if (path.indexOf(CONFIG.cities[i].pathIncludes) !== -1) {
        return CONFIG.cities[i];
      }
    }
    return null;
  }

  function resolveFeedUrl(city) {
    var url = city.feedUrl;
    if (!url) throw new Error('Missing feedUrl for city config');
    if (CONFIG.corsProxyPrefix) {
      return CONFIG.corsProxyPrefix + encodeURIComponent(url);
    }
    return url;
  }

  function cacheKey(city) {
    return CONFIG.cacheKeyPrefix + city.feedUrl;
  }

  function readCache(city) {
    try {
      var raw = window.localStorage.getItem(cacheKey(city));
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.items) return null;
      if (Date.now() - parsed.ts > CONFIG.cacheTtlMs) return null;
      return parsed.items;
    } catch (e) {
      return null;
    }
  }

  function writeCache(city, items) {
    try {
      window.localStorage.setItem(
        cacheKey(city),
        JSON.stringify({ ts: Date.now(), items: items })
      );
    } catch (e) {
      // Ignore quota / private mode failures.
    }
  }

  function clearCache(city) {
    try {
      window.localStorage.removeItem(cacheKey(city));
    } catch (e) {
      // Ignore private mode failures.
    }
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function textOf(el) {
    if (!el) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function firstChildByLocalName(parent, localName) {
    if (!parent || !parent.children) return null;
    var i;
    for (i = 0; i < parent.children.length; i++) {
      if (parent.children[i].localName === localName) return parent.children[i];
    }
    return null;
  }

  function attr(el, name) {
    return el && el.getAttribute ? el.getAttribute(name) || '' : '';
  }

  function rawNodeText(el) {
    if (!el) return '';
    try {
      return new XMLSerializer().serializeToString(el);
    } catch (e) {
      return el.textContent || '';
    }
  }

  function extractImageFromRaw(raw) {
    if (!raw) return '';
    var marker = raw.match(/<!--\s*st-image:\s*(https?:\/\/[^>\s]+)\s*-->/i);
    if (marker && marker[1]) return marker[1].replace(/&amp;/g, '&');
    var img = raw.match(/src=["'](https?:\/\/[^"']+)["']/i);
    if (img && img[1]) return img[1].replace(/&amp;/g, '&');
    return '';
  }

  function storyIdFromUrl(url) {
    if (!url) return '';
    var match = String(url).match(/-(\d+)\/?(?:[?#]|$)/);
    return match ? match[1] : '';
  }

  function sponsoredPathToken(city) {
    // morePath: /yorkton-today/yorkton-sponsored-content/
    // token used for quick rejects (example.com, wrong section URLs)
    var parts = String(city.morePath || '').split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : 'sponsored-content';
  }

  function villageFeedUrl(city) {
    var path = String(city.morePath || '').replace(/\/+$/, '');
    if (!path) return '';
    return window.location.origin + '/rss' + path;
  }

  function parseItems(xmlText) {
    var doc = new window.DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    var nodes = doc.getElementsByTagName('item');
    var items = [];
    var seenLinks = {};
    var i;

    for (i = 0; i < nodes.length && items.length < CONFIG.maxItems; i++) {
      var item = nodes[i];
      var title = textOf(firstChildByLocalName(item, 'title'));
      var link = textOf(firstChildByLocalName(item, 'link'));
      var descEl = firstChildByLocalName(item, 'description');
      var rawDescription = rawNodeText(descEl);
      var description = stripHtml(textOf(descEl));
      var pubDate = textOf(firstChildByLocalName(item, 'pubDate'));

      if (!title || !link) continue;
      if (seenLinks[link]) continue;
      seenLinks[link] = true;

      var image = '';
      var enclosure = firstChildByLocalName(item, 'enclosure');
      if (enclosure) image = attr(enclosure, 'url');

      if (!image) {
        var mediaNodes = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content');
        if (!mediaNodes.length) mediaNodes = item.getElementsByTagName('media:content');
        if (!mediaNodes.length) mediaNodes = item.getElementsByTagName('content');
        if (mediaNodes.length) image = attr(mediaNodes[0], 'url');
      }

      // Zapier Create Item has no enclosure field, so images are passed inside Content.
      if (!image) image = extractImageFromRaw(rawDescription);

      items.push({
        title: title,
        link: link,
        excerpt: description,
        image: image,
        pubDate: pubDate
      });
    }

    return items;
  }

  function parseVillageStoryIds(xmlText) {
    var doc = new window.DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    var nodes = doc.getElementsByTagName('item');
    var ids = {};
    var i;
    for (i = 0; i < nodes.length; i++) {
      var link = textOf(firstChildByLocalName(nodes[i], 'link'));
      var id = storyIdFromUrl(link);
      if (id) ids[id] = true;
    }
    return ids;
  }

  function filterLikelySponsored(city, items) {
    var token = sponsoredPathToken(city);
    return (items || []).filter(function (item) {
      return item && item.link && String(item.link).indexOf(token) !== -1;
    });
  }

  function filterAgainstVillage(city, items) {
    var url = villageFeedUrl(city);
    if (!url) return Promise.resolve(filterLikelySponsored(city, items));

    return fetch(url, {
      credentials: 'omit',
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Village RSS fetch failed: ' + res.status);
        return res.text();
      })
      .then(function (xml) {
        var liveIds = parseVillageStoryIds(xml);
        // Empty Village section = show nothing, even if Zapier still has old items.
        return (items || []).filter(function (item) {
          var id = storyIdFromUrl(item && item.link);
          return id && liveIds[id];
        });
      })
      .catch(function () {
        // If Village check fails, at least drop obvious non-sponsored / sample URLs.
        return filterLikelySponsored(city, items);
      });
  }

  function rememberFiltered(city, items) {
    if (items && items.length) writeCache(city, items);
    else clearCache(city);
    return items;
  }

  function fetchItems(city) {
    var cached = readCache(city);
    if (cached && cached.length) {
      // Re-check Village on cache hits so removals show up before TTL expires.
      return filterAgainstVillage(city, cached).then(function (items) {
        return rememberFiltered(city, items);
      });
    }

    return fetch(resolveFeedUrl(city), {
      credentials: 'omit',
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('RSS fetch failed: ' + res.status);
        return res.text();
      })
      .then(function (xml) {
        return filterAgainstVillage(city, parseItems(xml));
      })
      .then(function (items) {
        return rememberFiltered(city, items);
      });
  }

  function formatDate(pubDate) {
    if (!pubDate) return '';
    var d = new Date(pubDate);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return d.toDateString();
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureStyles() {
    if (document.getElementById('st-sponsored-rss-styles')) return;

    var style = document.createElement('style');
    style.id = 'st-sponsored-rss-styles';
    style.type = 'text/css';
    style.textContent = [
      '#' + CONFIG.rootId + ' {',
      '  --st-sponsored-green: #016a1b;',
      '  --st-sponsored-ink: #1a1a1a;',
      '  --st-sponsored-muted: #5c5c5c;',
      '  --st-sponsored-line: #e4e4e4;',
      '  margin: 0 0 1.25rem;',
      '  padding: 0;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__shell {',
      '  border: 1px solid var(--st-sponsored-line);',
      '  background: #fff;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__head {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 10px 12px 8px;',
      '  border-bottom: 1px solid var(--st-sponsored-line);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__pill {',
      '  display: inline-block;',
      '  padding: 3px 9px;',
      '  border-radius: 999px;',
      '  background: rgba(1, 106, 27, 0.1);',
      '  border: 1px solid rgba(1, 106, 27, 0.28);',
      '  color: var(--st-sponsored-green);',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.04em;',
      '  text-transform: uppercase;',
      '  line-height: 1.3;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__list {',
      '  margin: 0;',
      '  padding: 0;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__item {',
      '  display: block;',
      '  padding: 12px;',
      '  text-decoration: none !important;',
      '  color: inherit;',
      '  border-bottom: 1px solid var(--st-sponsored-line);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__item:last-child {',
      '  border-bottom: 0;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__item:hover .st-sponsored-rss__title {',
      '  color: var(--st-sponsored-green);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__row {',
      '  display: flex;',
      '  gap: 10px;',
      '  align-items: flex-start;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__thumb {',
      '  flex: 0 0 84px;',
      '  width: 84px;',
      '  height: 56px;',
      '  object-fit: cover;',
      '  display: block;',
      '  background: #f2f2f2;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__body {',
      '  min-width: 0;',
      '  flex: 1;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__title {',
      '  margin: 0 0 6px;',
      '  font-size: 16px;',
      '  line-height: 1.25;',
      '  font-weight: 700;',
      '  color: var(--st-sponsored-ink);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__excerpt {',
      '  margin: 0 0 8px;',
      '  font-size: 13px;',
      '  line-height: 1.4;',
      '  color: var(--st-sponsored-muted);',
      '  display: -webkit-box;',
      '  -webkit-line-clamp: 3;',
      '  -webkit-box-orient: vertical;',
      '  overflow: hidden;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__meta {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  align-items: baseline;',
      '  gap: 8px;',
      '  font-size: 12px;',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__time {',
      '  color: var(--st-sponsored-muted);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__more {',
      '  display: block;',
      '  padding: 10px 12px;',
      '  border-top: 1px solid var(--st-sponsored-line);',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  text-decoration: none !important;',
      '  color: var(--st-sponsored-green);',
      '}',
      '#' + CONFIG.rootId + ' .st-sponsored-rss__more:hover {',
      '  text-decoration: underline !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function renderItem(item) {
    var dateLabel = formatDate(item.pubDate);
    var thumb = item.image
      ? '<img class="st-sponsored-rss__thumb" src="' + escapeHtml(item.image) + '" alt="" loading="lazy" width="84" height="56">'
      : '';

    return [
      '<a class="st-sponsored-rss__item media media-bordered" href="' + escapeHtml(item.link) + '">',
      '  <div class="st-sponsored-rss__row">',
      thumb,
      '    <div class="st-sponsored-rss__body media-body">',
      '      <h3 class="st-sponsored-rss__title media-heading mt-0 mb-1">' + escapeHtml(item.title) + '</h3>',
      item.excerpt
        ? '      <div class="st-sponsored-rss__excerpt media-intro">' + escapeHtml(item.excerpt) + '</div>'
        : '',
      '      <div class="st-sponsored-rss__meta media-links">',
      dateLabel ? '        <time datetime="' + escapeHtml(item.pubDate) + '" class="st-sponsored-rss__time">' + escapeHtml(dateLabel) + '</time>' : '',
      '        <span class="theme-colour">Read more &gt;</span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function buildRoot(city, items) {
    var root = document.createElement('div');
    root.id = CONFIG.rootId;
    root.className = 'st-sponsored-rss';
    root.setAttribute('data-st-sponsored-rss', '1');
    root.setAttribute('data-st-city', city.pathIncludes);
    root.innerHTML = [
      '<div class="st-sponsored-rss__shell">',
      '  <div class="st-sponsored-rss__head">',
      '    <span class="st-sponsored-rss__pill">' + escapeHtml(CONFIG.label) + '</span>',
      '  </div>',
      '  <div class="st-sponsored-rss__list">',
      items.map(renderItem).join(''),
      '  </div>',
      '  <a class="st-sponsored-rss__more theme-colour" href="' + escapeHtml(city.morePath) + '">' + escapeHtml(CONFIG.moreLabel) + ' &gt;</a>',
      '</div>'
    ].join('\n');
    return root;
  }

  function findInjectTarget() {
    var col = document.querySelector(CONFIG.injectSelector);
    if (!col) return null;
    var firstDiv = null;
    var i;
    for (i = 0; i < col.children.length; i++) {
      if (col.children[i].tagName === 'DIV') {
        firstDiv = col.children[i];
        break;
      }
    }
    if (!firstDiv) return null;
    return { col: col, after: firstDiv };
  }

  function inject(city, items) {
    if (!items || !items.length) return;
    if (document.getElementById(CONFIG.rootId)) return;

    var target = findInjectTarget();
    if (!target) return;

    ensureStyles();
    var root = buildRoot(city, items);

    if (target.after.nextSibling) {
      target.col.insertBefore(root, target.after.nextSibling);
    } else {
      target.col.appendChild(root);
    }
  }

  function run() {
    var city = getCity();
    if (!city) return;
    if (document.getElementById(CONFIG.rootId)) return;

    fetchItems(city)
      .then(function (items) {
        inject(city, items);
      })
      .catch(function (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[st-sponsored-rss] feed load failed', err);
        }
      });
  }

  function waitForTarget(attemptsLeft) {
    if (!getCity()) return;
    if (findInjectTarget()) {
      run();
      return;
    }
    if (attemptsLeft <= 0) return;
    window.setTimeout(function () {
      waitForTarget(attemptsLeft - 1);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      waitForTarget(20);
    });
  } else {
    waitForTarget(20);
  }
})();
