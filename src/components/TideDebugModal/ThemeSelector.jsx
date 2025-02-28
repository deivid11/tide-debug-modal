import React from 'react';

const ThemeSelector = ({ theme, setTheme }) => (
    <div className="theme-selector">
        <label>Theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Dark</option>
            <option value="monokai">Monokai</option>
            <option value="normal">Normal</option>

        </select>
    </div>
);

export default ThemeSelector;