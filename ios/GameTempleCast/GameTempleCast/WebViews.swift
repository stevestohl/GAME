import WebKit

enum WebViews {
    /// A web view for either screen. Both share one set of website data, so the phone and the TV see the same sign-in.
    static func make(isTV: Bool = false) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        // The TV can't be tapped, so its narrator and music have to be allowed to start on their own
        config.mediaTypesRequiringUserActionForPlayback = []
        // Lets the website tell it's running in the app, if it ever needs to
        config.applicationNameForUserAgent = "GameTempleApp/0.1"
        config.userContentController.addUserScript(WKUserScript(source: skipKeepAwakeVideoScript, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // The TV's lobby doesn't need "Cast now to screen!" either: it's already on the TV
        let hide = isTV ? ".cc-cast-now, .cc-lobby-tip" : ".cc-lobby-tip"
        config.userContentController.addUserScript(WKUserScript(source: tidyScript(hiding: hide), injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        if isTV {
            config.userContentController.addUserScript(WKUserScript(source: tvViewportScript, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isInspectable = true   // Safari's Develop menu can look inside, for testing
        webView.backgroundColor = .black
        webView.isOpaque = false
        return webView
    }

    /// The TV's buttons, for the remote on the phone: their labels, in order. Each one is tagged so it can be tapped later.
    /// A button's description comes first (an icon button like 🔇 says "Turn the music on"), and the site's nav bar is left out.
    static let listButtonsScript = """
        [...document.querySelectorAll('button')]
            .filter((b) => b.offsetParent !== null && !b.disabled && !b.closest('.gt-nav'))
            .map((b, i) => {
                b.dataset.gtRemote = String(i);
                return { id: String(i), label: (b.getAttribute('aria-label') || b.title || b.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 40) };
            })
            .filter((b) => b.label)
        """

    /// The lobby's tips are for the website in a browser: turn off Battery Saver, and hide the browser bar. In the app
    /// the screen stays awake by itself and there's no browser bar, so leave them out.
    static func tidyScript(hiding selectors: String) -> String {
        """
        (() => {
            const style = document.createElement('style');
            style.textContent = '\(selectors) { display: none !important; }';
            (document.head || document.documentElement).appendChild(style);
        })();
        """
    }

    /// 📐 The game's TV screens were made for a phone turned sideways and mirrored to the TV: the page is laid out at
    /// the phone's size and blown up to fill the screen. Their text grows with the screen, but only up to a phone-sized
    /// limit, so laid out at a TV's own 1920×1080 everything came out small, lost in big empty cards. So the TV's page
    /// is laid out 854 web pixels wide (480 high on a 16:9 TV), and iOS scales it up to fill the screen, like mirroring.
    /// The site's own viewport tag says "as wide as the screen", so it's changed as soon as it appears, before the
    /// page is first drawn. (Zooming the web view instead doesn't work: iOS still lays the page out 1920 wide.)
    static let tvViewportScript = """
        (() => {
            const content = 'width=854';
            const fix = () => {
                const metas = document.querySelectorAll('meta[name="viewport"]');
                metas.forEach((meta) => meta.setAttribute('content', content));
                return metas.length > 0;
            };
            const watch = new MutationObserver(() => { if (fix()) watch.disconnect(); });
            watch.observe(document, { childList: true, subtree: true });
            document.addEventListener('DOMContentLoaded', () => {
                watch.disconnect();
                if (!fix()) {
                    const meta = document.createElement('meta');
                    meta.name = 'viewport';
                    meta.content = content;
                    document.head.appendChild(meta);
                }
            });
        })();
        """

    /// The app keeps the phone awake itself (AppDelegate), so the website's keep-awake video (src/hooks/useWakeLock.js)
    /// isn't needed here, and on an iPhone it stops whatever sound was already playing when it starts, like the lobby
    /// music. This quietly skips just that video: a hidden data: video, which nothing else on the site uses.
    static let skipKeepAwakeVideoScript = """
        (() => {
            const play = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function (...args) {
                const isKeepAwake = this.tagName === 'VIDEO'
                    && this.getAttribute('aria-hidden') === 'true'
                    && (this.currentSrc || this.src || '').startsWith('data:video/');
                return isKeepAwake ? Promise.resolve() : play.apply(this, args);
            };
        })();
        """

    /// A pretend tap on the TV's page: the game switches its audio engine on for any tap (src/chime.js).
    /// It's the end of a touch, not the start: the start of one also restarts the page's keep-awake video
    /// (useWakeLock.js), and on an iPhone starting that video stops the narrator mid-sentence.
    static let wakeSoundScript = "document.dispatchEvent(new Event('touchend'))"

    /// The sound check, run on the TV's page (an async function body: `musicURL` is passed in)
    static let soundCheckScript = """
        const result = {};
        try {
            result.musicSwitch = localStorage.getItem('gt-music-muted') === '1' ? 'switched OFF' : 'on';
        } catch (e) {
            result.musicSwitch = 'no game showing';
        }
        try {
            const Context = window.AudioContext || window.webkitAudioContext;
            const ctx = new Context();
            if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
            const tone = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.3;
            tone.frequency.value = 660;
            tone.connect(gain);
            gain.connect(ctx.destination);
            tone.start();
            tone.stop(ctx.currentTime + 1);
            result.beep = ctx.state === 'running' ? 'played' : `not allowed (${ctx.state})`;
        } catch (e) {
            result.beep = `error: ${e.message}`;
        }
        await new Promise((r) => setTimeout(r, 1300));
        try {
            const music = new Audio(musicURL);
            music.volume = 0.7;
            await music.play();
            setTimeout(() => music.pause(), 4000);
            result.music = 'played';
        } catch (e) {
            result.music = `not allowed (${e.name})`;
        }
        return result;
        """

    static func tapButtonScript(id: String) -> String {
        "document.querySelector('[data-gt-remote=\"\(id)\"]')?.click()"
    }
}
