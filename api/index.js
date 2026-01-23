// api/index.js – Platform-C (ENHANCED)

export default function handler(req, res) {
  const securityString = process.env.MASTER_SECURITY_STRING || '__SECURITY_STRING__';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Video Player</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: white;
            min-height: 100vh;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        body * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px 0;
            box-shadow: 0 4px 30px rgba(0,0,0,0.7);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .status-badge {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .input-section {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .input-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        input {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: white;
            font-size: 15px;
            margin-bottom: 20px;
            transition: all 0.3s;
        }
        input:focus { 
            outline: none; 
            border-color: #667eea; 
            background: rgba(255,255,255,0.08);
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        input::placeholder { color: rgba(255,255,255,0.4); }
        .btn {
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s;
        }
        .btn:hover:not(:disabled) { 
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .video-section {
            display: none;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .video-section.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .video-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 25px;
            align-items: center;
        }
        .video-title {
            font-size: 22px;
            font-weight: 700;
        }
        .close-btn {
            padding: 10px 20px;
            background: rgba(244, 67, 54, 0.2);
            border: 1px solid rgba(244, 67, 54, 0.3);
            color: #f44336;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .close-btn:hover {
            background: rgba(244, 67, 54, 0.3);
            transform: translateY(-2px);
        }
        .player-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 50px rgba(0,0,0,0.8);
        }
        video, iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        video { object-fit: contain; }
        .custom-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 70%, transparent 100%);
            padding: 60px 20px 20px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
        .player-wrapper:hover .custom-controls { opacity: 1; }
        .player-wrapper.playing .custom-controls { opacity: 0; }
        .player-wrapper.playing:hover .custom-controls { opacity: 1; }
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            margin-bottom: 15px;
            cursor: pointer;
            position: relative;
        }
        .progress-container:hover {
            height: 8px;
            margin-bottom: 14px;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 3px;
            width: 0%;
            position: relative;
            transition: width 0.1s;
        }
        .progress-bar::after {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.3s;
        }
        .progress-container:hover .progress-bar::after {
            opacity: 1;
        }
        .controls-row { 
            display: flex; 
            align-items: center; 
            gap: 15px;
            flex-wrap: wrap;
        }
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s;
            padding: 5px;
        }
        .control-btn:hover {
            transform: scale(1.2);
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
        }
        .time { 
            color: white; 
            font-size: 14px; 
            min-width: 110px;
            font-weight: 500;
        }
        .volume-group { 
            display: flex; 
            gap: 10px; 
            align-items: center;
            margin-left: auto;
        }
        .volume-slider {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            outline: none;
        }
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
        .volume-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        .settings-menu {
            position: absolute;
            bottom: 80px;
            right: 20px;
            background: rgba(20, 20, 30, 0.98);
            border-radius: 12px;
            padding: 10px;
            display: none;
            min-width: 200px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
        }
        .settings-menu.active { display: block; animation: slideUp 0.3s; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .settings-item {
            padding: 12px 15px;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .settings-item:hover {
            background: rgba(102, 126, 234, 0.3);
        }
        .settings-item.active {
            background: rgba(102, 126, 234, 0.5);
            color: white;
            font-weight: 600;
        }
        .settings-label {
            font-size: 14px;
            color: rgba(255,255,255,0.9);
        }
        .settings-value {
            font-size: 13px;
            color: rgba(255,255,255,0.6);
            margin-left: 10px;
        }
        .error {
            background: rgba(244, 67, 54, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
            border: 1px solid rgba(244, 67, 54, 0.3);
        }
        .loading { text-align: center; padding: 60px; color: rgba(255,255,255,0.6); }
        .spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        video::-webkit-media-controls { display: none !important; }
        .center-play-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            color: white;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            text-shadow: 0 0 20px rgba(0,0,0,0.8);
        }
        .player-wrapper.paused .center-play-btn { opacity: 0.9; }
        .player-wrapper:hover.paused .center-play-btn { opacity: 1; }
    </style>
</head>
<body oncontextmenu="return false;">
    <div class="header">
        <div class="header-content">
            <div class="logo">🎬 Secure Video Player</div>
            <div class="status-badge">⚡ Protected Streaming</div>
        </div>
    </div>

    <div class="container">
        <div class="input-section">
            <div class="input-title">Load Your Video</div>
            <input 
                type="url" 
                id="videoUrl" 
                placeholder="Paste your encrypted video URL..."
                onkeypress="if(event.key==='Enter')loadVideo()"
                autocomplete="off"
            >
            <button class="btn" onclick="loadVideo()" id="loadBtn">▶️ Load Video</button>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Loading secure video stream...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div class="video-title">Now Playing</div>
                <button class="close-btn" onclick="closeVideo()">✕ Close</button>
            </div>
            <div class="player-wrapper paused" id="playerWrapper">
                <video id="videoPlayer" playsinline preload="metadata" oncontextmenu="return false;"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                
                <div class="center-play-btn">▶️</div>
                
                <div class="custom-controls" id="customControls">
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>
                    <div class="controls-row">
                        <button class="control-btn" id="playBtn" title="Play/Pause">▶️</button>
                        <span class="time" id="timeDisplay">0:00 / 0:00</span>
                        <button class="control-btn" id="settingsBtn" title="Settings">⚙️</button>
                        <div class="volume-group">
                            <button class="control-btn" id="volumeBtn" title="Mute/Unmute">🔊</button>
                            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="100">
                        </div>
                        <button class="control-btn" id="fullscreenBtn" title="Fullscreen">⛶</button>
                    </div>
                </div>

                <div class="settings-menu" id="settingsMenu">
                    <div style="padding: 10px 15px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px;">Playback Settings</div>
                    <div style="padding: 5px 15px; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px;">Speed</div>
                    <div class="settings-item" onclick="setSpeed(0.25)" data-speed="0.25">
                        <span class="settings-label">0.25x</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(0.5)" data-speed="0.5">
                        <span class="settings-label">0.5x</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(0.75)" data-speed="0.75">
                        <span class="settings-label">0.75x</span>
                    </div>
                    <div class="settings-item active" onclick="setSpeed(1)" data-speed="1">
                        <span class="settings-label">Normal</span>
                        <span class="settings-value">✓</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(1.25)" data-speed="1.25">
                        <span class="settings-label">1.25x</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(1.5)" data-speed="1.5">
                        <span class="settings-label">1.5x</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(1.75)" data-speed="1.75">
                        <span class="settings-label">1.75x</span>
                    </div>
                    <div class="settings-item" onclick="setSpeed(2)" data-speed="2">
                        <span class="settings-label">2x</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const SEC = '${securityString}';
        let vid = null;
        let ifr = null;
        let settingsOpen = false;

        // Disable dev tools
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });

        document.addEventListener('contextmenu', e => e.preventDefault());

        async function loadVideo() {
            const url = document.getElementById('videoUrl').value.trim();
            const err = document.getElementById('error');
            const load = document.getElementById('loadingSection');
            const sec = document.getElementById('videoSection');
            vid = document.getElementById('videoPlayer');
            ifr = document.getElementById('iframePlayer');
            const btn = document.getElementById('loadBtn');

            if (!url || !url.includes('/video/')) {
                err.textContent = '❌ Invalid URL format';
                err.style.display = 'block';
                setTimeout(() => err.style.display = 'none', 5000);
                return;
            }

            err.style.display = 'none';
            sec.classList.remove('active');
            load.style.display = 'block';
            btn.disabled = true;

            try {
                const parts = url.split('/');
                const id = parts[parts.length - 1];
                const base = url.substring(0, url.lastIndexOf('/video/'));
                
                const res = await fetch(base + '/api/video/' + id, {
                    headers: { 'X-Security-String': SEC }
                });
                const data = await res.json();

                if (!data.success) throw new Error(data.message || 'Failed to load video');

                if (data.useIframe) {
                    ifr.src = data.streamUrl;
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                    document.getElementById('customControls').style.display = 'none';
                    document.querySelector('.center-play-btn').style.display = 'none';
                } else {
                    const streamUrl = data.proxyUrl + '?key=' + encodeURIComponent(SEC);
                    
                    vid.src = streamUrl;
                    vid.style.display = 'block';
                    ifr.style.display = 'none';
                    document.getElementById('customControls').style.display = 'block';
                    document.querySelector('.center-play-btn').style.display = 'block';
                    
                    vid.load();
                    initControls();
                }

                load.style.display = 'none';
                sec.classList.add('active');
                sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                btn.disabled = false;
            } catch (e) {
                load.style.display = 'none';
                err.textContent = '❌ ' + e.message;
                err.style.display = 'block';
                btn.disabled = false;
            }
        }

        function initControls() {
            const play = document.getElementById('playBtn');
            const prog = document.getElementById('progressContainer');
            const bar = document.getElementById('progressBar');
            const time = document.getElementById('timeDisplay');
            const vbtn = document.getElementById('volumeBtn');
            const vslider = document.getElementById('volumeSlider');
            const full = document.getElementById('fullscreenBtn');
            const settings = document.getElementById('settingsBtn');
            const wrapper = document.getElementById('playerWrapper');

            function toggle() {
                if (vid.paused) {
                    vid.play();
                    play.textContent = '⏸️';
                    wrapper.classList.remove('paused');
                    wrapper.classList.add('playing');
                } else {
                    vid.pause();
                    play.textContent = '▶️';
                    wrapper.classList.add('paused');
                    wrapper.classList.remove('playing');
                }
            }

            play.onclick = toggle;
            vid.onclick = toggle;

            vid.ontimeupdate = () => {
                if (vid.duration && isFinite(vid.duration)) {
                    bar.style.width = (vid.currentTime / vid.duration * 100) + '%';
                    time.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
                }
            };

            prog.onclick = e => {
                if (vid.duration && isFinite(vid.duration)) {
                    const rect = prog.getBoundingClientRect();
                    vid.currentTime = ((e.clientX - rect.left) / rect.width) * vid.duration;
                }
            };

            vslider.oninput = e => {
                vid.volume = e.target.value / 100;
                vbtn.textContent = e.target.value == 0 ? '🔇' : e.target.value < 50 ? '🔉' : '🔊';
            };

            vbtn.onclick = () => {
                if (vid.volume > 0) {
                    vid.volume = 0;
                    vslider.value = 0;
                    vbtn.textContent = '🔇';
                } else {
                    vid.volume = 1;
                    vslider.value = 100;
                    vbtn.textContent = '🔊';
                }
            };

            settings.onclick = (e) => {
                e.stopPropagation();
                toggleSettings();
            };

            full.onclick = () => {
                const w = document.getElementById('playerWrapper');
                if (!document.fullscreenElement) {
                    w.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            };

            // Close settings when clicking outside
            document.addEventListener('click', (e) => {
                const menu = document.getElementById('settingsMenu');
                if (settingsOpen && !menu.contains(e.target) && e.target !== settings) {
                    menu.classList.remove('active');
                    settingsOpen = false;
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (!vid || vid.style.display === 'none') return;
                
                switch(e.key) {
                    case ' ':
                        e.preventDefault();
                        toggle();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        vid.currentTime = Math.max(0, vid.currentTime - 5);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        vid.volume = Math.min(1, vid.volume + 0.1);
                        vslider.value = vid.volume * 100;
                        vbtn.textContent = vid.volume == 0 ? '🔇' : vid.volume < 0.5 ? '🔉' : '🔊';
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        vid.volume = Math.max(0, vid.volume - 0.1);
                        vslider.value = vid.volume * 100;
                        vbtn.textContent = vid.volume == 0 ? '🔇' : vid.volume < 0.5 ? '🔉' : '🔊';
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        full.click();
                        break;
                    case 'm':
                    case 'M':
                        e.preventDefault();
                        vbtn.click();
                        break;
                }
            });
        }

        function toggleSettings() {
            const menu = document.getElementById('settingsMenu');
            settingsOpen = !settingsOpen;
            if (settingsOpen) {
                menu.classList.add('active');
            } else {
                menu.classList.remove('active');
            }
        }

        function setSpeed(speed) {
            if (!vid) return;
            vid.playbackRate = speed;
            
            document.querySelectorAll('.settings-item').forEach(item => {
                item.classList.remove('active');
                const check = item.querySelector('.settings-value');
                if (check) check.textContent = '';
            });
            
            const activeItem = document.querySelector('[data-speed="' + speed + '"]');
            if (activeItem) {
                activeItem.classList.add('active');
                let valueSpan = activeItem.querySelector('.settings-value');
                if (!valueSpan) {
                    valueSpan = document.createElement('span');
                    valueSpan.className = 'settings-value';
                    activeItem.appendChild(valueSpan);
                }
                valueSpan.textContent = '✓';
            }
        }

        function fmt(s) {
            if (!s || !isFinite(s)) return '0:00';
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = Math.floor(s % 60);
            if (h > 0) {
                return h + ':' + (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
            }
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            if (vid) {
                vid.pause();
                vid.src = '';
            }
            if (ifr) ifr.src = '';
            document.getElementById('videoUrl').value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Check security string
        if (SEC === '__SECURITY_STRING__') {
            console.warn('Security not configured');
            const err = document.getElementById('error');
            err.textContent = '⚠️ Security configuration missing';
            err.style.display = 'block';
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
