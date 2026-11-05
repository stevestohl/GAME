import WebKit

enum WebViews {
    /// A web view for either screen. Both share one set of website data, so the phone and the TV see the same sign-in.
    static func make() -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        // The TV can't be tapped, so its narrator and music have to be allowed to start on their own
        config.mediaTypesRequiringUserActionForPlayback = []
        // Lets the website tell it's running in the app, if it ever needs to
        config.applicationNameForUserAgent = "GameTempleApp/0.1"
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

    static func tapButtonScript(id: String) -> String {
        "document.querySelector('[data-gt-remote=\"\(id)\"]')?.click()"
    }
}
