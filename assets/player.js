(function () {
  function setup(wrap) {
    var video = wrap.querySelector("video");
    var button = wrap.querySelector("[data-play-button]");
    var stream = wrap.getAttribute("data-stream");
    var attached = false;
    function attach() {
      if (attached || !video || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function play() {
      attach();
      wrap.classList.add("is-playing");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          wrap.classList.remove("is-playing");
        });
      }
    }
    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
    }
  }
  Array.prototype.slice.call(document.querySelectorAll("[data-stream]")).forEach(setup);
})();
