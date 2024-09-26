import { useState, useEffect } from "react";

const useKeyboard = () => {
    const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat) return;
        if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
        ) {
            return; // Ignore key presses if the target is an input or textarea
        }
        setKeysPressed((prevKeys) => new Set(prevKeys.add(event.key)));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
        ) {
            return; // Ignore key presses if the target is an input or textarea
        }
        setKeysPressed((prevKeys) => {
            const newKeys = new Set(prevKeys);
            newKeys.delete(event.key);
            return newKeys;
        });
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return keysPressed;
};

export default useKeyboard;
