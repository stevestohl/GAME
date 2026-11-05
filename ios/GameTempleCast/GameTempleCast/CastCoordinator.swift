import Foundation
import os

let castLog = Logger(subsystem: "org.gametemple.cast", category: "cast")

/**
 * 🔀 Decides what each screen shows. The website needs no changes: starting a cast game sends the phone to
 * the game's TV page (for example /couchcast?room=CABC&role=caster). If a TV is connected, that page goes to
 * the TV instead, and the phone opens the join page for the same room, so the host plays from the phone.
 * The TV page rejoins the room as its TV, the same way it does after a refresh.
 */
final class CastCoordinator {
    static let shared = CastCoordinator()

    // The cast games' TV pages
    private let tvPaths: Set<String> = ["/couchcast", "/triviacast", "/listcast", "/mixup", "/reshuffled"]

    weak var phone: PhoneViewController?
    weak var tv: TVViewController?
    private(set) var tvURL: URL?

    /// The site the app runs. A launch argument can point it somewhere else for testing: -GTBaseURL http://localhost:5005
    let baseURL: URL = {
        let value = UserDefaults.standard.string(forKey: "GTBaseURL")
            ?? Bundle.main.object(forInfoDictionaryKey: "GTBaseURL") as? String
            ?? "https://game-temple.org"
        return URL(string: value)!
    }()

    var isTVConnected: Bool { tv != nil }

    /// A cast game's TV page: its room code, or nil for any other page
    func roomCode(ofTVPage url: URL) -> String? {
        guard tvPaths.contains(url.path),
              let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
              items.first(where: { $0.name == "role" })?.value == "caster",
              let room = items.first(where: { $0.name == "room" })?.value, !room.isEmpty
        else { return nil }
        return room
    }

    // MARK: - The phone

    /// The room whose "Play on TV" guide was turned down, so it doesn't keep coming back for that game
    private var playingOnPhone: String?

    /// The phone went to a new page (the website changes pages without reloading, so this follows the address).
    /// A game just started: it goes to the TV, or with no TV yet, the phone shows how to connect one.
    func phoneDidShow(_ url: URL) {
        guard let room = roomCode(ofTVPage: url) else { return }
        if isTVConnected {
            moveToTV(url, room: room)
        } else if room != playingOnPhone {
            phone?.showConnectGuide(room: room)
        }
    }

    /// "No TV? Show the game on this phone": the old way, with this phone mirrored or held up as the screen
    func playOnPhone(room: String) {
        playingOnPhone = room
    }

    // MARK: - The TV

    func tvDidConnect(_ tv: TVViewController) {
        castLog.notice("TV connected")
        self.tv = tv
        phone?.tvConnectionChanged()
        // A game already showing on the phone moves over now
        if let url = phone?.currentURL, let room = roomCode(ofTVPage: url) {
            moveToTV(url, room: room)
        } else {
            tv.showWaiting()
        }
    }

    func tvDidDisconnect() {
        castLog.notice("TV disconnected")
        tv = nil
        phone?.tvConnectionChanged()
        // The game comes back to the phone, so it can be mirrored the old way
        if let url = tvURL { phone?.load(url) }
        tvURL = nil
    }

    /// The TV went to a new page: once it leaves the game (the host tapped Home), it waits for the next one
    func tvDidShow(_ url: URL) {
        guard tvURL != nil, roomCode(ofTVPage: url) == nil else { return }
        tvURL = nil
        tv?.showWaiting()
    }

    private func moveToTV(_ url: URL, room: String) {
        castLog.notice("Room \(room, privacy: .public) moves to the TV")
        tvURL = url
        tv?.show(url)
        var join = URLComponents(url: baseURL.appendingPathComponent("join"), resolvingAgainstBaseURL: false)!
        join.queryItems = [URLQueryItem(name: "room", value: room)]
        phone?.load(join.url!)
    }
}
