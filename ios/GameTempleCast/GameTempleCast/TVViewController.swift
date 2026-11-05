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
    private let webView = WebViews.make()
    private let waiting = UILabel()
    private var urlWatch: NSKeyValueObservation?

    struct RemoteButton { let id: String; let label: String }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.12, green: 0.15, blue: 0.42, alpha: 1)
        webView.frame = view.bounds
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.isHidden = true
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
    }

    func showWaiting() {
        loadViewIfNeeded()
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
}
