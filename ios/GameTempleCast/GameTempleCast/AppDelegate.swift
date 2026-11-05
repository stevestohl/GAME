import UIKit

/**
 * 📺 Game Temple, as an iPhone app. The phone runs the website, and when a TV is connected over AirPlay,
 * the TV gets its own screen instead of a copy of the phone's: the cast game's TV page goes there, and the
 * phone becomes the host's player controller. (See CastCoordinator.swift for how a game moves to the TV.)
 */
@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // A game is running on the TV: the phone shouldn't go to sleep under it
        application.isIdleTimerDisabled = true
        return true
    }

    // The phone's own screen, or a TV connected over AirPlay (or a cable)
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        if session.role == .windowExternalDisplayNonInteractive {
            let config = UISceneConfiguration(name: "TV", sessionRole: session.role)
            config.delegateClass = TVSceneDelegate.self
            return config
        }
        let config = UISceneConfiguration(name: "Phone", sessionRole: session.role)
        config.delegateClass = PhoneSceneDelegate.self
        return config
    }
}
