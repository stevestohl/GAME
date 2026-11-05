import UIKit

/**
 * 📺 "Play on TV": shown when a game starts and no TV is connected yet. Apps can't switch Screen Mirroring on,
 * so this shows the two steps and waits. The moment the TV connects, it says so and gets out of the way,
 * and the game moves over by itself. People without a TV can keep playing the old way on this phone.
 */
final class ConnectTVViewController: UIViewController {
    var onUsePhone: (() -> Void)?

    private let spinner = UIActivityIndicatorView(style: .medium)
    private let status = UILabel()
    private var usePhone: UIButton?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground

        let title = UILabel()
        title.text = "📺 Play on TV"
        title.font = .systemFont(ofSize: 28, weight: .bold)

        let subtitle = UILabel()
        subtitle.text = "Your phone stays your controller."
        subtitle.font = .preferredFont(forTextStyle: .body)
        subtitle.textColor = .secondaryLabel

        let steps = UIStackView(arrangedSubviews: [
            step(1, "Swipe down from the top-right corner of your screen to open Control Center."),
            step(2, "Tap Screen Mirroring, then pick your TV."),
        ])
        steps.axis = .vertical
        steps.spacing = 14

        spinner.startAnimating()
        status.text = "Waiting for your TV…"
        status.font = .preferredFont(forTextStyle: .headline)
        let waiting = UIStackView(arrangedSubviews: [spinner, status])
        waiting.spacing = 10

        var look = UIButton.Configuration.plain()
        look.title = "No TV? Show the game on this phone"
        let usePhone = UIButton(configuration: look)
        usePhone.addAction(UIAction { [weak self] _ in self?.onUsePhone?() }, for: .touchUpInside)
        self.usePhone = usePhone

        let column = UIStackView(arrangedSubviews: [title, subtitle, steps, waiting, usePhone])
        column.axis = .vertical
        column.alignment = .leading
        column.spacing = 22
        column.setCustomSpacing(6, after: title)
        column.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(column)
        NSLayoutConstraint.activate([
            column.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 28),
            column.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            column.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
        ])
    }

    /// The TV is on: say so for a moment, then close
    func showConnected(then close: @escaping () -> Void) {
        loadViewIfNeeded()
        spinner.stopAnimating()
        spinner.isHidden = true
        status.text = "✅ Connected! Starting on your TV…"
        usePhone?.isHidden = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9, execute: close)
    }

    private func step(_ number: Int, _ text: String) -> UIView {
        let badge = UILabel()
        badge.text = "\(number)"
        badge.font = .systemFont(ofSize: 17, weight: .bold)
        badge.textColor = .white
        badge.textAlignment = .center
        badge.backgroundColor = .systemBlue
        badge.layer.cornerRadius = 15
        badge.layer.masksToBounds = true
        badge.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([badge.widthAnchor.constraint(equalToConstant: 30), badge.heightAnchor.constraint(equalToConstant: 30)])

        let words = UILabel()
        words.text = text
        words.numberOfLines = 0
        words.font = .preferredFont(forTextStyle: .body)

        let row = UIStackView(arrangedSubviews: [badge, words])
        row.spacing = 12
        row.alignment = .center
        return row
    }
}
