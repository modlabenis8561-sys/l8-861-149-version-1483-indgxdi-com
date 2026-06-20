function setupMoviePlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('moviePlayOverlay');
    var button = document.getElementById('moviePlayButton');
    var hlsInstance = null;
    var started = false;

    function startPlayback() {
        if (!video || !streamUrl) {
            return;
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        if (!started) {
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play();
            } else if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
            } else {
                video.src = streamUrl;
                video.play();
            }
        } else {
            video.play();
        }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}
