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

extension PhoneViewController: UIAdaptivePresentationControllerDelegate {
    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        guard let guide = presentationController.presentedViewController as? ConnectTVViewController else { return }
        guide.onUsePhone?()
    }
}
