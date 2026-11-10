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
 * The city match is a path substring, so a story under /regina-today also
 * matches. Skip any path that includes sponsored-content so the widget is
 * not injected on the sponsored article itself.
 *
 * Injects into .widget-area-col after the first child <div>.
 *
 * The inner markup matches a sidebar thumbs widget so the card styles apply.
 * The root is not a .widget and its links have no data-id. Village's editor
 * treats .widget, and story links with data-id, as editable, which was
 * interfering with editing the real sidebar widgets. Title and spacing are
 * applied here instead.
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
    label: 'Beyond the Headlines',
    pill: 'Sponsored',
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
    if (path.indexOf('sponsored-content') !== -1) return null;
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function thumbUrl(url) {
    if (!url) return '';
    var base = String(url).split(';')[0];
    if (base.indexOf('vmcdn.ca') === -1) return url;
    return base + ';w=300;h=200;mode=crop';
  }

  function ensureStyles() {
    if (document.getElementById('st-sponsored-rss-styles')) return;
    var style = document.createElement('style');
    style.id = 'st-sponsored-rss-styles';
    style.textContent = [
      '#st-sponsored-rss {',
      '  margin-top: 30px;',
      '  margin-bottom: 30px;',
      '}',
      '#st-sponsored-rss > h2.title {',
      '  font-size: 0.9em;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  border-bottom: none;',
      '  border-top: 1px solid #000;',
      '  margin-top: 0 !important;',
      '  margin-bottom: 5px !important;',
      '  padding-top: 5px;',
      '  padding-bottom: 5px;',
      '  letter-spacing: 0.05em;',
      '  color: #000;',
      '}',
      '#st-sponsored-rss .st-sponsored-pill {',
      '  display: inline-block;',
      '  margin: 0 0 4px;',
      '  padding: 2px 8px;',
      '  border-radius: 999px;',
      '  background: #1665a8;',
      '  color: #fff;',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  line-height: 1.4;',
      '  text-decoration: none;',
      '}',
      '#st-sponsored-rss a:hover .st-sponsored-pill,',
      '#st-sponsored-rss a:focus .st-sponsored-pill {',
      '  background: #1665a8;',
      '  color: #fff;',
      '  text-decoration: none;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function renderItem(item) {
    var image = thumbUrl(item.image);
    var thumb = image
      ? '<div class="card-snippet-left"><img alt="' + escapeHtml(item.title) + '" class="lazyimg lazy-loaded" data-src="' + escapeHtml(image) + '" height="80" src="' + escapeHtml(image) + '" style="aspect-ratio:120/80" width="120"></div>'
      : '';

    return [
      '<li>',
      '<a href="' + escapeHtml(item.link) + '" class="' + (image ? 'card-snippet' : 'ib mt-1 mb-1') + '">',
      thumb,
      image ? '<div class="card-snippet-body">' : '',
      '<span class="st-sponsored-pill">' + escapeHtml(CONFIG.pill) + '</span>',
      '<div class="card-title">' + escapeHtml(item.title) + '</div>',
      item.excerpt
        ? '<div class="clamp clamp-2 card-text mt-1 mb-1">' + escapeHtml(item.excerpt) + '</div>'
        : '',
      image ? '</div>' : '',
      '</a>',
      '</li>'
    ].join('');
  }

  function buildRoot(city, items) {
    var root = document.createElement('div');
    root.id = CONFIG.rootId;
    root.className = 'st-sponsored-rss';
    root.setAttribute('data-st-sponsored-rss', '1');
    root.setAttribute('data-st-city', city.pathIncludes);
    root.innerHTML = [
      '<h2 class="title mt-0 mb-1">' + escapeHtml(CONFIG.label) + '</h2>',
      '<div class="section-cards">',
      '<div class="card">',
      '<ul class="card-list nav">',
      items.map(renderItem).join(''),
      '</ul>',
      '</div>',
      '</div>'
    ].join('');
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
