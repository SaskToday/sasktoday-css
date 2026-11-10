(function () {
  var DONE = "data-hires";
  var MAX = 1200;
  var STEP = 50;
  var SEL = "img.lazyimg, img.avatar-img, .tablist-cards img.card-img";
  var io = null;

  function parseDim(url, key) {
    var m = url.match(new RegExp(";" + key + "=(\\d+)"));
    return m ? parseInt(m[1], 10) : 0;
  }

  function displayWidth(img) {
    var w = 0;
    if (img.parentElement) w = img.parentElement.clientWidth;
    if (!w) w = img.clientWidth;
    if (!w) w = parseInt(img.getAttribute("width"), 10) || 0;
    return w;
  }

  function hiresUrl(url, img) {
    if (!url || url.indexOf(";w=") < 0 || url.indexOf("blank.gif") >= 0) return "";
    var ow = parseDim(url, "w");
    if (!ow) return "";
    var cw = displayWidth(img);
    if (!cw) return "";
    var nw = Math.min(MAX, Math.ceil((cw * 2) / STEP) * STEP);
    if (nw <= ow) return url;
    var next = url.replace(/;w=\d+/, ";w=" + nw);
    var oh = parseDim(url, "h");
    if (oh) next = next.replace(/;h=\d+/, ";h=" + Math.round(nw * (oh / ow)));
    return next;
  }

  function bump(img) {
    if (!img || img.nodeType !== 1 || img.getAttribute(DONE)) return true;

    var dataSrc = img.getAttribute("data-src") || "";
    var src = img.getAttribute("src") || "";
    var raw = dataSrc.indexOf(";w=") >= 0 ? dataSrc : src;
    var next = hiresUrl(raw, img);
    if (!next) return false;

    if (dataSrc && dataSrc !== next) img.setAttribute("data-src", next);
    if (src.indexOf(";w=") >= 0 && src.indexOf("blank.gif") < 0 && src !== next) {
      img.src = next;
    }
    img.setAttribute(DONE, "1");
    if (io) io.unobserve(img);
    return true;
  }

  function track(img) {
    if (!img || img.nodeType !== 1 || img.getAttribute(DONE)) return;
    if (bump(img)) return;
    if (io) io.observe(img);
  }

  function scan(root) {
    var list = (root || document).querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) track(list[i]);
  }

  function watch() {
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) bump(entries[i].target);
        }
      }, { rootMargin: "200px 0px" });
    }

    scan(document);
    window.addEventListener("load", function () { scan(document); });

    if (typeof MutationObserver !== "function") return;

    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        if (!nodes) continue;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === "IMG" && n.matches && n.matches(SEL)) track(n);
          else if (n.querySelectorAll) scan(n);
        }
      }
    });

    mo.observe(document.body, { subtree: true, childList: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
