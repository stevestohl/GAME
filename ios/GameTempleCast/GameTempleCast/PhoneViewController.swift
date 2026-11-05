import UIKit
import WebKit

final class PhoneSceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        let phone = PhoneViewController()
        window.rootViewController = phone
        window.makeKeyAndVisible()
        self.window = window
        CastCoordinator.shared.phone = phone
        #if DEBUG
        // The simulator can't always attach a TV: -GTFakeTV YES draws one in a corner of the phone instead
        if UserDefaults.standard.bool(forKey: "GTFakeTV") { phone.showPretendTV() }
        #endif
    }
}

/**
 * 📱 The phone: the website, plus a TV remote button while a TV is connected. The TV can't be tapped,
 * so the remote lists the buttons on the TV's screen (Play Again, Home, Pause...) and taps them for you.
 */
final class PhoneViewController: UIViewController {
    private let webView = WebViews.make()
    private var urlWatch: NSKeyValueObservation?
    private let remoteButton = UIButton(type: .system)

    var currentURL: URL? { webView.url }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        webView.allowsBackForwardNavigationGestures = true
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        var look = UIButton.Configuration.filled()
        look.title = "📺 TV"
        look.cornerStyle = .capsule
        look.baseBackgroundColor = UIColor(white: 0, alpha: 0.7)
        look.baseForegroundColor = .white
        remoteButton.configuration = look
        remoteButton.translatesAutoresizingMaskIntoConstraints = false
        remoteButton.accessibilityLabel = "TV remote"
        remoteButton.addTarget(self, action: #selector(openRemote), for: .touchUpInside)
        remoteButton.isHidden = true
        view.addSubview(remoteButton)
        NSLayoutConstraint.activate([
            remoteButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            remoteButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -12),
        ])

        // The website changes pages without reloading: follow its address instead
        urlWatch = webView.observe(\.url, options: [.new]) { webView, _ in
            if let url = webView.url { CastCoordinator.shared.phoneDidShow(url) }
        }
        load(CastCoordinator.shared.baseURL.appendingPathComponent("home"))
    }

    func load(_ url: URL) {
        webView.load(URLRequest(url: url))
    }

    #if DEBUG
    /// For testing without a TV: a 1920×1080 TV screen, shrunk into the bottom corner, that nobody can tap (like a real one)
    func showPretendTV() {
        loadViewIfNeeded()
        let tv = TVViewController()
        addChild(tv)
        let box = UIView(frame: CGRect(x: 0, y: 0, width: 1920, height: 1080))
        box.isUserInteractionEnabled = false
        box.layer.borderColor = UIColor.white.cgColor
        box.layer.borderWidth = 6
        tv.view.frame = box.bounds
        box.addSubview(tv.view)
        tv.didMove(toParent: self)
        let scale: CGFloat = 300 / 1920
        box.transform = CGAffineTransform(scaleX: scale, y: scale)
        view.addSubview(box)
        box.center = CGPoint(x: 8 + 150, y: view.bounds.height - 110)
        CastCoordinator.shared.tvDidConnect(tv)
    }
    #endif

    func tvConnectionChanged() {
        remoteButton.isHidden = !CastCoordinator.shared.isTVConnected
    }

    @objc private func openRemote() {
        guard let tv = CastCoordinator.shared.tv else { return }
        tv.listButtons { [weak self] buttons in
            guard let self else { return }
            let sheet = UIAlertController(
                title: "TV remote",
                message: buttons.isEmpty ? "Nothing to tap on the TV right now." : "Tap a button on the TV's screen.",
                preferredStyle: .actionSheet
            )
            for button in buttons {
                sheet.addAction(UIAlertAction(title: button.label, style: .default) { _ in tv.tapButton(id: button.id) })
            }
            sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
            sheet.popoverPresentationController?.sourceView = self.remoteButton
            self.present(sheet, animated: true)
        }
    }
}
