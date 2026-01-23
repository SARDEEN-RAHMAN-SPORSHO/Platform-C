export default function handler(req, res) {
  const securityString = process.env.MASTER_SECURITY_STRING || '__SECURITY_STRING__';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: white;
            min-height: 100vh;
            user-select: none;
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.5);
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
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
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
        }
        input:focus { outline: none; border-color: #667eea; background: rgba(255,255,255,0.08); }
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
        }
        .btn:hover:not(:disabled) { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .video-section {
            display: none;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            border-radius: 20px;
        }
        .video-section.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .video-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .close-btn {
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            border-radius: 10px;
            cursor: pointer;
        }
        .player-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
            border-radius: 16px;
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
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            padding: 40px 20px 15px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
        .player-wrapper:hover .custom-controls { opacity: 1; }
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            margin-bottom: 15px;
            cursor: pointer;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 3px;
            width: 0%;
        }
        .controls-row { display: flex; align-items: center; gap: 15px; }
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        .time { color: white; font-size: 14px; min-width: 110px; }
        .volume-group { display: flex; gap: 10px; margin-left: auto; }
        .error {
            background: rgba(244, 67, 54, 0.2);
            padding: 16px;
            border-radius: 12px;
            margin-top: 20px;
            color: #f44336;
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
    </style>
</head>
<body oncontextmenu="return false;">
    <div class="header">
        <div class="header-content">
            <div class="logo">🎬 Video Player</div>
            <div class="status-badge">⚡ Fast Streaming</div>
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
            >
            <button class="btn" onclick="loadVideo()" id="loadBtn">▶️ Load Video</button>
            <div id="error" class="error" style="display: none;"></div>
        </div>

        <div id="loadingSection" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>

        <div id="videoSection" class="video-section">
            <div class="video-header">
                <div style="font-size: 22px; font-weight: 700;">Now Playing</div>
                <button class="close-btn" onclick="closeVideo()">✕ Close</button>
            </div>
            <div class="player-wrapper" id="playerWrapper">
                <video id="videoPlayer" playsinline preload="metadata" oncontextmenu="return false;"></video>
                <iframe id="iframePlayer" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                
                <div class="custom-controls" id="customControls">
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>
                    <div class="controls-row">
                        <button class="control-btn" id="playBtn">▶️</button>
                        <span class="time" id="timeDisplay">0:00 / 0:00</span>
                        <div class="volume-group">
                            <button class="control-btn" id="volumeBtn">🔊</button>
                            <input type="range" id="volumeSlider" min="0" max="100" value="100" style="width:100px;margin:0;">
                        </div>
                        <button class="control-btn" id="fullscreenBtn">⛶</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const SEC = '${securityString}';
        let vid = null;
        let ifr = null;

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
                err.textContent = '❌ Invalid URL';
                err.style.display = 'block';
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

                if (!data.success) throw new Error(data.message);

                if (data.useIframe) {
                    ifr.src = data.streamUrl;
                    ifr.style.display = 'block';
                    vid.style.display = 'none';
                    document.getElementById('customControls').style.display = 'none';
                } else {
                    // DIRECT STREAM - Add security key to URL
                    const streamUrl = data.proxyUrl + '?key=' + encodeURIComponent(SEC);
                    
                    vid.src = streamUrl;
                    vid.style.display = 'block';
                    ifr.style.display = 'none';
                    document.getElementById('customControls').style.display = 'block';
                    
                    vid.load();
                    initControls();
                }

                load.style.display = 'none';
                sec.classList.add('active');
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

            function toggle() {
                if (vid.paused) {
                    vid.play();
                    play.textContent = '⏸️';
                } else {
                    vid.pause();
                    play.textContent = '▶️';
                }
            }

            play.onclick = toggle;
            vid.onclick = toggle;

            vid.ontimeupdate = () => {
                if (vid.duration) {
                    bar.style.width = (vid.currentTime / vid.duration * 100) + '%';
                    time.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
                }
            };

            prog.onclick = e => {
                if (vid.duration) {
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

            full.onclick = () => {
                const w = document.getElementById('playerWrapper');
                if (!document.fullscreenElement) {
                    w.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            };
        }

        function fmt(s) {
            if (!s || !isFinite(s)) return '0:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        function closeVideo() {
            document.getElementById('videoSection').classList.remove('active');
            if (vid) vid.src = '';
            if (ifr) ifr.src = '';
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
