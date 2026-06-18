// Sakura falling petals — decorative, aria-hidden
(function () {
  for (var i = 8; i--; ) {
    var p = document.createElement("div");
    p.className = "sakura-petal";
    p.setAttribute("aria-hidden", "true");
    var s = p.style;
    s.left = 5 + i * 12 + Math.random() * 6 + "%";
    s.width = 6 + Math.random() * 8 + "px";
    s.height = s.width;
    s.animationDuration = 14 + Math.random() * 10 + "s";
    s.animationDelay = -Math.random() * 16 + "s";
    s.opacity = 0.06 + Math.random() * 0.08;
    document.body.appendChild(p);
  }
})();
