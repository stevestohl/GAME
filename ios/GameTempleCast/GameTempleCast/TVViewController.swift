import UIKit
import WebKit

final class TVSceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        let tv = TVViewController()
        window.rootViewController = tv
        window.isHidden = false
        self.window = window
        CastCoordinator.shared.tvDidConnect(tv)
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        window = nil
        CastCoordinator.shared.tvDidDisconnect()
    }
}

/**
 * 📺 The TV: a cast game's TV page, or a "start a game on your phone" card between games. Nobody can
 * touch this screen, so its buttons are pressed through the phone's TV remote.
 */
final class TVViewController: UIViewController {
    private let webView = WebViews.make(isTV: true)
    private let waiting = UILabel()
    private var urlWatch: NSKeyValueObservation?
    private var soundWake: Timer?

    struct RemoteButton { let id: String; let label: String }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.12, green: 0.15, blue: 0.42, alpha: 1)
        webView.frame = view.bounds
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.isHidden = true
        // Nobody scrolls a TV, and there's nothing on it to keep clear of
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        // ⌨️ A web view makes room for the keyboard, but iOS reports the phone's keyboard in the phone's screen
        // coordinates, and those land on the TV's screen too. So typing on the phone pushed the TV's page up and
        // left a white bar under it, which stayed after the keyboard closed: "closed" is just below the phone's
        // screen (y 874 or so), still inside a 1080-point TV. The TV has no keyboard, so its web view doesn't listen.
        let keyboardNotes: [NSNotification.Name] = [
            UIResponder.keyboardWillShowNotification, UIResponder.keyboardDidShowNotification,
            UIResponder.keyboardWillHideNotification, UIResponder.keyboardDidHideNotification,
            UIResponder.keyboardWillChangeFrameNotification, UIResponder.keyboardDidChangeFrameNotification,
        ]
        for name in keyboardNotes { NotificationCenter.default.removeObserver(webView, name: name, object: nil) }
        view.addSubview(webView)

        waiting.text = "🏛️ Game Temple\n\nStart a Game-Cast game on your phone"
        waiting.numberOfLines = 0
        waiting.textAlignment = .center
        waiting.textColor = .white
        waiting.font = .systemFont(ofSize: 44, weight: .bold)
        waiting.frame = view.bounds.insetBy(dx: 60, dy: 60)
        waiting.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(waiting)

        urlWatch = webView.observe(\.url, options: [.new]) { webView, _ in
            if let url = webView.url { CastCoordinator.shared.tvDidShow(url) }
        }
    }

    func show(_ url: URL) {
        loadViewIfNeeded()
        waiting.isHidden = true
        webView.isHidden = false
        webView.load(URLRequest(url: url))
        // 🔊 The timer music and sound effects come from the page's audio engine, which only starts after a tap,
        // and nobody can tap a TV. The page switches it on for any tap, and a tap sent from the app counts:
        // so send one now and then (it's also how the sound comes back if iOS ever pauses it).
        soundWake?.invalidate()
        soundWake = Timer.scheduledTimer(withTimeInterval: 3, repeats: true) { [weak self] _ in
            self?.webView.evaluateJavaScript(WebViews.wakeSoundScript)
        }
    }

    func showWaiting() {
        loadViewIfNeeded()
        soundWake?.invalidate()
        soundWake = nil
        webView.isHidden = true
        waiting.isHidden = false
        webView.load(URLRequest(url: URL(string: "about:blank")!))
    }

    func listButtons(_ done: @escaping ([RemoteButton]) -> Void) {
        guard !webView.isHidden else { return done([]) }
        webView.evaluateJavaScript(WebViews.listButtonsScript) { result, _ in
            let rows = (result as? [[String: Any]]) ?? []
            done(rows.compactMap { row in
                guard let id = row["id"] as? String, let label = row["label"] as? String else { return nil }
                return RemoteButton(id: id, label: label)
            })
        }
    }

    func tapButton(id: String) {
        webView.evaluateJavaScript(WebViews.tapButtonScript(id: id))
    }

    /// 🔊 Plays a beep, then a few seconds of lobby music, from the TV's page, and reports whether each was allowed
    func soundCheck(_ done: @escaping (String) -> Void) {
        let musicURL = CastCoordinator.shared.baseURL.appendingPathComponent("audio/LobbyMusic.mp3").absoluteString
        webView.callAsyncJavaScript(WebViews.soundCheckScript, arguments: ["musicURL": musicURL], in: nil, in: .page) { result in
            let rows = (try? result.get()) as? [String: Any] ?? [:]
            func text(_ key: String) -> String { rows[key] as? String ?? "didn't run" }
            done("Beep: \(text("beep"))\nMusic file: \(text("music"))\nThe TV's music button: \(text("musicSwitch"))")
        }
    }
}
