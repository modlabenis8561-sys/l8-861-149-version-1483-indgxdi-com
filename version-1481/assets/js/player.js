(function () {
  const video = document.getElementById('movie-player');
  const overlay = document.querySelector('.player-overlay');

  if (!video || !overlay) {
    return;
  }

  let ready = false;
  let hls = null;

  const bindStream = function () {
    if (ready) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');

    if (nativeHls) {
      video.src = stream;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = stream;
    ready = true;
  };

  const startPlay = function () {
    bindStream();
    overlay.classList.add('hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('hidden');
      });
    }
  };

  overlay.addEventListener('click', startPlay);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
