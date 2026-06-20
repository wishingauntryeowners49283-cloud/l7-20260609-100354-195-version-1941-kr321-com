(function () {
  function tryPlay(video) {
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  window.initMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);

    if (!video || !streamUrl) {
      return;
    }

    var player = video.closest("[data-player]");
    var overlay = player ? player.querySelector("[data-player-overlay]") : null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      tryPlay(video);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
