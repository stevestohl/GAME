import React from 'react';
import { NavLink, Link } from 'react-router-dom';

/**
 * 🧭 Frosted-glass navigation bar.
 * Brand on the left, pill-style section switcher on the right.
 * The active section lights up in the Join Room blue.
 *
 * Links: /home (games) and /barhome (bartending).
 */

const TempleIcon = () => (
    <svg viewBox="0 0 24 24" className="gt-nav-icon" aria-hidden="true">
        <path d="M3 9 L12 4 L21 9 Z" />
        <path d="M3 9.5 H21" />
        <path d="M6 12 V17 M10 12 V17 M14 12 V17 M18 12 V17" />
        <path d="M3.5 19.5 H20.5" />
    </svg>
);

const MartiniIcon = () => (
    <svg viewBox="0 0 24 24" className="gt-nav-icon" aria-hidden="true">
        <path d="M4 5 H20 L12 13 Z" />
        <path d="M12 13 V20 M8 20.5 H16" />
        <path d="M15 2.5 L11 9" />
    </svg>
);

const LINKS = [
    { to: '/home', label: 'Games', Icon: TempleIcon },
    { to: '/barhome', label: 'Bar Training', Icon: MartiniIcon },
];

export default function NavBar() {
    return (
        <header className="gt-nav">
            <div className="gt-nav-inner">
                <Link to="/home" className="gt-brand" aria-label="Game Temple home">
                    <span className="gt-brand-mark">
                        <TempleIcon />
                    </span>
                    <span className="gt-brand-text">
                        Game<span>Temple</span>
                    </span>
                </Link>

                <nav className="gt-nav-pills" aria-label="Main">
                    {LINKS.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `gt-pill ${isActive ? 'active' : ''}`}
                        >
                            <Icon />
                            <span className="gt-pill-label">{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}
