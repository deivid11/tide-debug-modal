import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"] }, // Include TypeScript if applicable
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        settings: {
            react: {
                version: "detect", // Automatically detect React version
            },
        },
        plugins: {
            pluginReact,
            "react-hooks": pluginReactHooks, // Register react-hooks plugin
        },
        rules: {
            "react/prop-types": "off",
            "react/jsx-key": "warn",
            "no-unused-vars": "warn",
            "react/react-in-jsx-scope": "off",
            "no-constant-binary-expression": "off",
            "no-unsafe-optional-chaining": "off",
            "react-hooks/rules-of-hooks": "warn", // Ensures hooks are used correctly
            "react-hooks/exhaustive-deps": "error", // Warns about incorrect dependencies
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
        },
    },
];
