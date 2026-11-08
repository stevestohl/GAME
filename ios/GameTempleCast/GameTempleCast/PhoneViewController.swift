import UIKit
import WebKit
import AVFoundation

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
        // -GTFakeTVAfter 10: the pretend TV arrives 10 seconds in, to test "Play on TV" waiting for it
        let delay = UserDefaults.standard.double(forKey: "GTFakeTVAfter")
        if delay > 0 { DispatchQueue.main.asyncAfter(deadline: .now() + delay) { phone.showPretendTV() } }
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
    /// ⏸️ Pauses (or resumes) the game on the TV: the pause button is on the TV's screen, which nobody can tap
    private let pauseButton = UIButton(type: .system)
    private let tvButtons = UIStackView()
    private var pauseWatch: Timer?
    private let pageEdge = PageEdgeView()

    var currentURL: URL? { webView.url }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        webView.allowsBackForwardNavigationGestures = true
        // 🎨 Past the end of a page, where the home bar is, the web view shows what's behind it: on pages that fit
        // the screen (like Join Room) that's a strip under the page after the first swipe. Behind it, carry on the
        // bottom edge of the site's background, in whatever theme the site is showing.
        webView.backgroundColor = .clear
        webView.configuration.userContentController.add(pageEdge, name: "gtPageEdge")
        webView.configuration.userContentController.addUserScript(WKUserScript(source: WebViews.pageEdgeScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
        pageEdge.translatesAutoresizingMaskIntoConstraints = false
        view.insertSubview(pageEdge, belowSubview: webView)
        NSLayoutConstraint.activate([
            pageEdge.topAnchor.constraint(equalTo: webView.topAnchor),
            pageEdge.bottomAnchor.constraint(equalTo: webView.bottomAnchor),
            pageEdge.leadingAnchor.constraint(equalTo: webView.leadingAnchor),
            pageEdge.trailingAnchor.constraint(equalTo: webView.trailingAnchor),
        ])

        var look = UIButton.Configuration.filled()
        look.title = "📺 TV"
        look.cornerStyle = .capsule
        look.baseBackgroundColor = UIColor(white: 0, alpha: 0.7)
        look.baseForegroundColor = .white
        remoteButton.configuration = look
        remoteButton.accessibilityLabel = "TV remote"
        remoteButton.addTarget(self, action: #selector(openRemote), for: .touchUpInside)
        pauseButton.configuration = look
        pauseButton.addTarget(self, action: #selector(tapPause), for: .touchUpInside)
        pauseButton.isHidden = true
        // In the lower left: the game's pages keep the room code in the lower right
        tvButtons.addArrangedSubview(remoteButton)
        tvButtons.addArrangedSubview(pauseButton)
        tvButtons.spacing = 8
        tvButtons.translatesAutoresizingMaskIntoConstraints = false
        tvButtons.isHidden = true
        view.addSubview(tvButtons)
        NSLayoutConstraint.activate([
            tvButtons.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            tvButtons.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -12),
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
        view.bringSubviewToFront(tvButtons)   // the TV buttons share its corner
        CastCoordinator.shared.tvDidConnect(tv)
    }
    #endif

    func tvConnectionChanged() {
        tvButtons.isHidden = !CastCoordinator.shared.isTVConnected
        watchPauseButton()
        // The TV came on while "Play on TV" was waiting: say so, then let the game move over
        if CastCoordinator.shared.isTVConnected, let guide = connectGuide {
            connectGuide = nil
            guide.showConnected { [weak guide] in guide?.dismiss(animated: true) }
        }
    }

    // MARK: - 📺 Play on TV

    private weak var connectGuide: ConnectTVViewController?

    /// A game started with no TV connected: show how to connect one, and wait
    func showConnectGuide(room: String) {
        guard connectGuide == nil, presentedViewController == nil else { return }
        let guide = ConnectTVViewController()
        guide.onUsePhone = { [weak self, weak guide] in
            CastCoordinator.shared.playOnPhone(room: room)
            if self?.connectGuide === guide { self?.connectGuide = nil }
            guide?.dismiss(animated: true)
        }
        if let sheet = guide.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }
        // Swiping it away means the same as "No TV? Show the game on this phone"
        guide.presentationController?.delegate = self
        connectGuide = guide
        present(guide, animated: true)
    }

    /// ⏸️ Shows the pause button whenever the TV's game has one (only while a round is running), saying what it'll do
    private func watchPauseButton() {
        pauseWatch?.invalidate()
        pauseWatch = nil
        guard CastCoordinator.shared.isTVConnected else { return showPause("") }
        pauseWatch = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            CastCoordinator.shared.tv?.pauseState { self?.showPause($0) }
        }
    }

    private func showPause(_ state: String) {
        let title = state.hasPrefix("Resume") ? "▶️ Resume" : "⏸️ Pause"
        if pauseButton.configuration?.title != title { pauseButton.configuration?.title = title }
        pauseButton.accessibilityLabel = state.isEmpty ? nil : state
        let hide = state.isEmpty
        if pauseButton.isHidden != hide { pauseButton.isHidden = hide }
    }

    @objc private func tapPause() {
        guard let tv = CastCoordinator.shared.tv else { return }
        tv.tapPause()
        // Show the change straight away, not on the next check
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in tv.pauseState { self?.showPause($0) } }
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
            sheet.addAction(UIAlertAction(title: "🔊 Sound check", style: .default) { [weak self] _ in self?.runSoundCheck(on: tv) })
            sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
            sheet.popoverPresentationController?.sourceView = self.remoteButton
            self.present(sheet, animated: true)
        }
    }

    /// Plays a test sound from the TV's page, then shows what happened, and where iOS is sending sound
    private func runSoundCheck(on tv: TVViewController) {
        tv.soundCheck { [weak self] report in
            let session = AVAudioSession.sharedInstance()
            let outputs = session.currentRoute.outputs.map { "\($0.portName) (\($0.portType.rawValue))" }.joined(separator: ", ")
            let message = "You should have heard a beep, then a few seconds of music, on the TV.\n\n\(report)\nSound is going to: \(outputs.isEmpty ? "nowhere" : outputs)\nSound mode: \(session.category.rawValue.replacingOccurrences(of: "AVAudioSessionCategory", with: ""))"
            castLog.notice("Sound check: \(message, privacy: .public)")
            let alert = UIAlertController(title: "Sound check", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            self?.present(alert, animated: true)
        }
    }
}

/// 🎨 Behind the phone's web view: the colours along the bottom edge of the site's background, left to right, sent
/// by WebViews.pageEdgeScript. They show past the end of the page, where the home bar is.
private final class PageEdgeView: UIView, WKScriptMessageHandler {
    override class var layerClass: AnyClass { CAGradientLayer.self }
    private var gradient: CAGradientLayer { layer as! CAGradientLayer }

    override init(frame: CGRect) {
        super.init(frame: frame)
        gradient.startPoint = CGPoint(x: 0, y: 0.5)
        gradient.endPoint = CGPoint(x: 1, y: 0.5)
        // The home screen's blue, until the site says otherwise
        show([[56, 73, 145], [88, 110, 199], [66, 82, 149]])
    }

    required init?(coder: NSCoder) { fatalError("Not used from a storyboard") }

    private func show(_ colors: [[Double]]) {
        gradient.colors = colors.map { UIColor(red: $0[0] / 255, green: $0[1] / 255, blue: $0[2] / 255, alpha: 1).cgColor }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let edge = message.body as? [[NSNumber]], edge.count >= 2, edge.allSatisfy({ $0.count == 3 }) else { return }
        show(edge.map { $0.map { min(max($0.doubleValue, 0), 255) } })
    }
}

extension PhoneViewController: UIAdaptivePresentationControllerDelegate {
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        guard let guide = presentationController.presentedViewController as? ConnectTVViewController else { return }
        guide.onUsePhone?()
    }
}
