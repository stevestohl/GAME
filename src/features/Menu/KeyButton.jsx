import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, onAuthChange } from '../../auth.js';
import { adminFetch, signOut } from '../Admin/adminApi.js';

const KeyIcon = () => (
    <svg viewBox="0 0 24 24" className="gt-nav-icon" aria-hidden="true">
        <circle cx="8" cy="15" r="4.5" />
        <path d="M11.5 11.5 L20 3 M16 7 L19 10 M13.5 9.5 L16 12" />
    </svg>
);

/**
 * 🔑 The key at the end of the nav bar. Signed out, it goes to the sign-in at /admin. Signed in, it
 * turns gold and opens a little menu. Regular players can ignore it: nothing needs a login to play.
 */
export default function KeyButton() {
    const navigate = useNavigate();
    const [signedIn, setSignedIn] = useState(!!getToken());
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => onAuthChange(() => setSignedIn(!!getToken())), []);

    // Who's this? (An old token gets cleared here too, turning the key back to plain.)
    useEffect(() => {
        if (!signedIn) { setName(''); return; }
        adminFetch('/me').then(({ user }) => setName(user.displayName)).catch(() => {});
    }, [signedIn]);

    // A tap anywhere else closes the menu
    useEffect(() => {
        if (!open) return undefined;
        const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('pointerdown', close);
        return () => document.removeEventListener('pointerdown', close);
    }, [open]);

    if (!signedIn) {
        return (
            <button type="button" className="gt-key" onClick={() => navigate('/admin')} aria-label="Sign in" title="Sign in">
                <KeyIcon />
            </button>
        );
    }

    return (
        <div className="gt-key-box" ref={boxRef}>
            <button type="button" className="gt-key is-on" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={name ? `Signed in as ${name}` : 'Signed in'} title={name || 'Signed in'}>
                <KeyIcon />
            </button>
            {open && (
                <div className="gt-key-menu">
                    {name && <div className="gt-key-name">{name}</div>}
                    <button type="button" onClick={() => { setOpen(false); navigate('/admin'); }}>Admin</button>
                    <button type="button" onClick={() => { setOpen(false); signOut(); }}>Sign out</button>
                </div>
            )}
        </div>
    );
}
