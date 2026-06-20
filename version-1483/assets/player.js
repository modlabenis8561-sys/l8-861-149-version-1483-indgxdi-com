(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector(".player-cover");
    var source = "";
    var prepared = false;
    var hlsInstance = null;

    if (typeof playerConfig !== "undefined" && playerConfig && playerConfig.source) {
      source = playerConfig.source;
    }

    function prepareVideo() {
      if (!video || !source || prepared) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      prepared = true;
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      prepareVideo();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!prepared) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
        prepared = false;
        hlsInstance = null;
      });
    }
  });
})();
