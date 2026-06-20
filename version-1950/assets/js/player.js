import { H as Hls } from './hls-core.js';

function initializePlayer() {
    const video = document.getElementById('movie-player');
    const startButton = document.querySelector('[data-player-start]');
    if (!video) {
        return;
    }

    const source = video.dataset.src;
    const shell = video.closest('.player-shell');
    let attached = false;
    let hls = null;

    function attachSource() {
        if (attached || !source) {
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (eventName, data) => {
                if (data && data.fatal) {
                    console.warn('HLS fatal error:', eventName, data);
                    hls.destroy();
                    hls = null;
                    video.src = source;
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        attached = true;
    }

    async function playVideo() {
        attachSource();
        try {
            await video.play();
        } catch (error) {
            console.warn('Playback requires user interaction or the source is temporarily unavailable.', error);
        }
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', () => {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('pause', () => {
        if (shell) {
            shell.classList.remove('is-playing');
        }
    });

    video.addEventListener('loadedmetadata', () => {
        if (shell) {
            shell.classList.add('is-ready');
        }
    });

    video.addEventListener('click', () => {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializePlayer);
