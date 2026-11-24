import UIKit
import AVFoundation

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
        // 🔊 The narrator and music are the point, not background noise: play them even with the phone on silent,
        // and send them over AirPlay to the TV (iOS otherwise treats web sound as ambient, which silent mutes)
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            castLog.error("Couldn't set up sound: \(error.localizedDescription, privacy: .public)")
        }
        return true
    }

    // The phone's own screen, or a TV connected over AirPlay (or a cable). On iOS 26 and earlier the TV arrives here
    // by itself; iOS 27 only offers it to an app that asks (PhoneViewController.askForTVScreen).
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        castNote("iOS offers a scene: \(session.role.rawValue)")
        if session.role == .windowExternalDisplayNonInteractive {
            return TVSceneDelegate.configuration()
        }
        let config = UISceneConfiguration(name: "Phone", sessionRole: session.role)
        config.delegateClass = PhoneSceneDelegate.self
        return config
    }
}
