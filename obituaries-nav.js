/**
 * SaskToday — Obituaries community secondary nav
 *
 * Injects a horizontal community nav into the first empty
 * <div class="obituaries-navigation"></div> placeholder.
 * Pages without that placeholder are left alone. Already-injected
 * placeholders are skipped.
 *
 * After publish, add a deferred footer script tag:
 *   <script src="https://sasktoday-css.pages.dev/obituaries-nav.js" defer></script>
 *
 * Desktop: left/right arrows, drag, wheel, and touch scroll (no edge fades).
 * Mobile: arrows hidden; same horizontal scroll with a thin scrollbar.
 */
(function () {
  var STYLE_ID = 'st-obituaries-nav-styles';
  var ROOT_ATTR = 'data-st-obituaries-nav';
  var INJECT_SELECTOR = '.obituaries-navigation';

  var LINKS = [
    { href: '/obituaries/assiniboia-obituaries', label: 'Assiniboia' },
    { href: '/obituaries/battlefords-obituaries', label: 'Battlefords' },
    { href: '/obituaries/canora-obituaries', label: 'Canora' },
    { href: '/obituaries/carlyle-obituaries', label: 'Carlyle' },
    { href: '/obituaries/estevan-obituaries', label: 'Estevan' },
    { href: '/obituaries/humboldt-obituaries', label: 'Humboldt' },
    { href: '/obituaries/kamsack-obituaries', label: 'Kamsack' },
    { href: '/obituaries/moose-jaw-obituaries', label: 'Moose Jaw' },
    { href: '/obituaries/preeceville-obituaries', label: 'Preeceville' },
    { href: '/obituaries/regina-obituaries', label: 'Regina' },
    { href: '/obituaries/saskatoon-obituaries', label: 'Saskatoon' },
    { href: '/obituaries/unity-wilkie-obituaries', label: 'Unity-Wilkie' },
    { href: '/obituaries/weyburn-obituaries', label: 'Weyburn' },
    { href: '/obituaries/yorkton-obituaries', label: 'Yorkton' }
  ];

  var LEFT_SVG =
    '<svg viewBox="0 0 498 800" width="18" height="28" aria-hidden="true" focusable="false">' +
    '<path d="M370.7,568.2c14.2,14.2,14.2,37.2,0,51.4c-7.1,7.1-16.4,10.6-25.7,10.6s-18.6-3.5-25.7-10.7L125.3,425.7' +
    'c-6.8-6.8-10.7-16.1-10.7-25.7c0-9.6,3.8-18.9,10.7-25.7l193.9-193.9c14.2-14.2,37.2-14.2,51.4,0c14.2,14.2,14.2,37.2,0,51.4' +
    'L202.5,400L370.7,568.2z"></path></svg>';

  var RIGHT_SVG =
    '<svg viewBox="0 0 498 800" width="18" height="28" aria-hidden="true" focusable="false">' +
    '<path d="M125.3,568.2c-14.2,14.2-14.2,37.2,0,51.4,7.1,7.1,16.4,10.6,25.7,10.6s18.6-3.5,25.7-10.7l194-193.8' +
    'c6.8-6.8,10.7-16.1,10.7-25.7s-3.8-18.9-10.7-25.7l-193.9-193.9c-14.2-14.2-37.2-14.2-51.4,0-14.2,14.2-14.2,37.2,0,51.4' +
    'l168.1,168.2-168.2,168.2Z"></path></svg>';

  function isEmptyPlaceholder(el) {
    if (!el) return false;
    if (el.getAttribute(ROOT_ATTR)) return false;
    if (el.querySelector('[' + ROOT_ATTR + ']')) return false;
    var text = (el.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    return text === '';
  }

  function findTarget() {
    var nodes = document.querySelectorAll(INJECT_SELECTOR);
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (isEmptyPlaceholder(nodes[i])) return nodes[i];
    }
    return null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.obituaries-navigation[' + ROOT_ATTR + '] {',
      '  font-size: 0;',
      '  line-height: 0;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .st-obituaries-nav {',
      '  font-size: 12px;',
      '  line-height: normal;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .container-secondary-nav {',
      '  max-width: 800px;',
      '  margin: 0 auto;',
      '  font-family: "Source Sans 3", sans-serif;',
      '  padding-bottom: 10px;',
      '  position: relative;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .small-nav-header {',
      '  padding-bottom: 5px;',
      '  margin-bottom: 10px;',
      '  font-size: 0;',
      '  font-family: "Source Sans 3", sans-serif;',
      '  font-weight: 700;',
      '  border-bottom: 4px solid #016a1b;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community {',
      '  display: flex;',
      '  flex-wrap: nowrap;',
      '  gap: 15px;',
      '  row-gap: 2px;',
      '  margin: 0;',
      '  font-size: 12px;',
      '  padding: 0 28px 8px;',
      '  border-radius: 4px;',
      '  position: relative;',
      '  background: #fff;',
      '  z-index: 1;',
      '  overflow-x: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  scrollbar-width: thin;',
      '  scrollbar-color: #cecece #ffffff;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community::-webkit-scrollbar {',
      '  height: 8px;',
      '  display: block;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community::-webkit-scrollbar-track {',
      '  background: #f5f5f5;',
      '  border-radius: 4px;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community::-webkit-scrollbar-thumb {',
      '  background: #cecece;',
      '  border-radius: 4px;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community::-webkit-scrollbar-thumb:hover {',
      '  background: #999;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community a {',
      '  text-decoration: none;',
      '  color: #333;',
      '  position: relative;',
      '  padding-bottom: 0;',
      '  white-space: nowrap;',
      '  flex: 0 0 auto;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community a:not(:last-child)::after {',
      '  content: "|";',
      '  position: absolute;',
      '  right: -10px;',
      '  color: #cecece;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community a::before {',
      '  content: "";',
      '  position: absolute;',
      '  width: 100%;',
      '  height: 1px;',
      '  bottom: 0;',
      '  left: 0;',
      '  background-color: #333;',
      '  transform: scaleX(0);',
      '  transition: transform 0.3s ease;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community a:hover::before {',
      '  transform: scaleX(1);',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-left-arrow,',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-right-arrow {',
      '  position: absolute;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 22px;',
      '  height: 32px;',
      '  padding: 0;',
      '  margin: 0;',
      '  border: 0;',
      '  background: rgba(255, 255, 255, 0.95);',
      '  border-radius: 4px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  cursor: pointer;',
      '  z-index: 20;',
      '  font-size: 18px;',
      '  user-select: none;',
      '  opacity: 0;',
      '  visibility: hidden;',
      '  transition: opacity 0.3s ease;',
      '  color: #222;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-left-arrow { left: 0; }',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-right-arrow { right: 0; }',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-left-arrow.show-arrow,',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-right-arrow.show-arrow {',
      '  opacity: 1;',
      '  visibility: visible;',
      '}',
      '.obituaries-navigation[' + ROOT_ATTR + '] .nav-community.dragging {',
      '  cursor: grabbing;',
      '  cursor: -webkit-grabbing;',
      '}',
      '@media screen and (max-width: 768px) {',
      '  .obituaries-navigation[' + ROOT_ATTR + '] .nav-left-arrow,',
      '  .obituaries-navigation[' + ROOT_ATTR + '] .nav-right-arrow {',
      '    display: none !important;',
      '  }',
      '  .obituaries-navigation[' + ROOT_ATTR + '] .nav-community {',
      '    padding: 0 0 8px;',
      '  }',
      '}',
      '@media screen and (min-width: 769px) {',
      '  .obituaries-navigation[' + ROOT_ATTR + '] .nav-community {',
      '    scrollbar-width: none;',
      '    -ms-overflow-style: none;',
      '  }',
      '  .obituaries-navigation[' + ROOT_ATTR + '] .nav-community::-webkit-scrollbar {',
      '    display: none;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function buildMarkup() {
    var linksHtml = '';
    var i;
    for (i = 0; i < LINKS.length; i++) {
      linksHtml +=
        '<a href="' + LINKS[i].href + '">' + LINKS[i].label + '</a>';
    }

    return (
      '<div class="st-obituaries-nav">' +
      '<div class="container-secondary-nav">' +
      '<div class="small-nav-header" aria-hidden="true"></div>' +
      '<nav class="nav-community" aria-label="Obituaries communities">' +
      linksHtml +
      '</nav>' +
      '<button type="button" class="nav-left-arrow" aria-label="Scroll communities left">' +
      LEFT_SVG +
      '</button>' +
      '<button type="button" class="nav-right-arrow" aria-label="Scroll communities right">' +
      RIGHT_SVG +
      '</button>' +
      '</div></div>'
    );
  }

  function bindScroll(root) {
    var nav = root.querySelector('.nav-community');
    var leftArrow = root.querySelector('.nav-left-arrow');
    var rightArrow = root.querySelector('.nav-right-arrow');
    if (!nav || !leftArrow || !rightArrow) return;

    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;

    function animateScroll(target, duration, callback) {
      duration = duration == null ? 200 : duration;
      var start = nav.scrollLeft;
      var change = target - start;
      var startTime = performance.now();

      function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }

      function animate(time) {
        var elapsed = time - startTime;
        var progress = Math.min(elapsed / duration, 1);
        nav.scrollLeft = start + change * easeInOut(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (callback) {
          callback();
        }
      }

      requestAnimationFrame(animate);
    }

    function updateUI() {
      var maxScroll = nav.scrollWidth - nav.clientWidth;
      var current = nav.scrollLeft;

      if (maxScroll <= 5) {
        leftArrow.classList.remove('show-arrow');
        rightArrow.classList.remove('show-arrow');
        return;
      }

      if (current > 5) leftArrow.classList.add('show-arrow');
      else leftArrow.classList.remove('show-arrow');

      if (current < maxScroll - 5) rightArrow.classList.add('show-arrow');
      else rightArrow.classList.remove('show-arrow');
    }

    nav.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        animateScroll(nav.scrollLeft + e.deltaY * 1.2, 90, updateUI);
      },
      { passive: false }
    );

    nav.addEventListener('mousedown', function (e) {
      isDown = true;
      nav.classList.add('dragging');
      startX = e.pageX;
      scrollLeft = nav.scrollLeft;
    });

    document.addEventListener('mouseup', function () {
      isDown = false;
      nav.classList.remove('dragging');
    });

    nav.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      nav.scrollLeft = scrollLeft - (e.pageX - startX) * 2;
      updateUI();
    });

    nav.addEventListener('touchstart', function (e) {
      isDown = true;
      startX = e.touches[0].pageX;
      scrollLeft = nav.scrollLeft;
    });

    nav.addEventListener('touchmove', function (e) {
      if (!isDown) return;
      nav.scrollLeft = scrollLeft - (e.touches[0].pageX - startX) * 2;
      updateUI();
    });

    nav.addEventListener('touchend', function () {
      isDown = false;
    });

    nav.addEventListener('scroll', updateUI);

    leftArrow.addEventListener('click', function () {
      animateScroll(nav.scrollLeft - 200, 250, updateUI);
    });

    rightArrow.addEventListener('click', function () {
      animateScroll(nav.scrollLeft + 200, 250, updateUI);
    });

    window.addEventListener('resize', updateUI);
    updateUI();
  }

  function inject() {
    var target = findTarget();
    if (!target) return;

    ensureStyles();
    target.setAttribute(ROOT_ATTR, '1');
    target.innerHTML = buildMarkup();
    bindScroll(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
