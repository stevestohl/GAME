import React from 'react';

/** Plain numbers as picker options */
export const numberOptions = (numbers) => numbers.map((n) => ({ value: n, label: String(n) }));

/**
 * 🎡 A setup choice in one glass pill: a small label on top, the choice underneath, and a ▾. Tapping it opens the
 * phone's own picker (the scrolling wheel on an iPhone, a list on Android, a menu on a computer): there's a real
 * <select> laid over the pill, invisible. Two of these fit side by side in one row (e.g. Questions and Level).
 *
 * options: [{ value, label }]
 */
export default function PickerPill({ label, value, options, onChange, disabled }) {
    const current = options.find((o) => String(o.value) === String(value)) || options[0];
    return (
        <label className={`gt-picker ${disabled ? 'is-disabled' : ''}`}>
            <span className="gt-picker-label">{label}</span>
            <span className="gt-picker-value">
                {current?.label}
                <span className="gt-picker-caret" aria-hidden="true">▾</span>
            </span>
            <select
                className="gt-picker-select"
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                    const picked = options.find((o) => String(o.value) === e.target.value);
                    if (picked) onChange(picked.value);
                }}
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    );
}
