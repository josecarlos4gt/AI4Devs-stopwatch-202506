/**
 * script.js
 *
 * This file contains the JavaScript logic for the Time Utility application,
 * including Stopwatch and Countdown functionalities.
 *
 * SOLID Principles Applied:
 * - Single Responsibility Principle (SRP): Each class/module has a single, well-defined responsibility.
 * - `TimeFormatter`: Responsible solely for formatting time values.
 * - `DisplayManager`: Manages UI visibility and content updates for time displays.
 * - `StopwatchLogic`: Handles the core logic of the stopwatch (start, pause, clear, timing).
 * - `CountdownLogic`: Handles the core logic of the countdown (set, start, pause, continue, clear, timing).
 * - `CountdownInputManager`: Manages the keypad input for setting countdown time.
 * - `AppRouter`: Manages screen transitions and overall application flow.
 * - Open/Closed Principle (OCP): New time utility features could be added without modifying existing `TimeFormatter` or `DisplayManager`.
 * - Liskov Substitution Principle (LSP): Not explicitly demonstrated with inheritance, but the design avoids problematic inheritance hierarchies.
 * - Interface Segregation Principle (ISP): Different classes interact with only the parts of the DOM/other classes they need.
 * - Dependency Inversion Principle (DIP): High-level modules (like `AppRouter`) depend on abstractions (e.g., methods of `StopwatchLogic`, `CountdownLogic`) rather than concrete implementations directly where possible, though direct instantiations are present for simplicity in this frontend app.
 */

// --- UTILITY FUNCTIONS & CONSTANTS ---
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;
const MAX_COUNTDOWN_MS = 24 * MS_PER_HOUR - 1; // Max 23:59:59.999

/**
 * Utility for robust DOM element selection.
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
const getElement = (selector) => {
    try {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`[DOM Warning] Element not found for selector: ${selector}`);
        }
        return element;
    } catch (error) {
        console.error(`[DOM Error] Failed to query selector "${selector}":`, error);
        return null;
    }
};

/**
 * Utility for robust DOM element selection (all).
 * @param {string} selector
 * @returns {NodeListOf<HTMLElement>}
 */
const getAllElements = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`[DOM Error] Failed to query all for selector "${selector}":`, error);
        return [];
    }
};

// --- CORE CLASSES ---

/**
 * TimeFormatter Class: Responsible for formatting milliseconds into HH:MM:SS.MMM.
 * Adheres to SRP.
 */
class TimeFormatter {
    /**
     * Formats milliseconds into HH:MM:SS string.
     * @param {number} ms - Time in milliseconds.
     * @returns {string} Formatted time (e.g., "01:23:45").
     */
    static formatTime(ms) {
        try {
            const totalSeconds = Math.floor(ms / MS_PER_SECOND);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return [hours, minutes, seconds]
                .map(unit => String(unit).padStart(2, '0'))
                .join(':');
        } catch (error) {
            console.error(`[TimeFormatter Error] Failed to format time ${ms}:`, error);
            return "00:00:00"; // Fallback
        }
    }

    /**
     * Formats milliseconds part (000-999).
     * @param {number} ms - Time in milliseconds.
     * @returns {string} Formatted milliseconds (e.g., "000", "123").
     */
    static formatMilliseconds(ms) {
        try {
            return String(ms % 1000).padStart(3, '0');
        } catch (error) {
            console.error(`[TimeFormatter Error] Failed to format milliseconds ${ms}:`, error);
            return "000"; // Fallback
        }
    }
}

/**
 * DisplayManager Class: Responsible for updating the visual time display.
 * Adheres to SRP.
 */
class DisplayManager {
    constructor(timeDisplayElement, msDisplayElement) {
        if (!timeDisplayElement || !msDisplayElement) {
            throw new Error("[DisplayManager] Required DOM elements are missing.");
        }
        this.timeDisplayElement = timeDisplayElement;
        this.msDisplayElement = msDisplayElement;
        console.log("[DisplayManager] Initialized.");
    }

    /**
     * Updates the time display with given milliseconds.
     * @param {number} ms - Time in milliseconds.
     */
    update(ms) {
        try {
            const formattedTime = TimeFormatter.formatTime(ms);
            const formattedMs = TimeFormatter.formatMilliseconds(ms);
            const [hours, minutes, seconds] = formattedTime.split(':');

            this.timeDisplayElement.querySelector('.hours').textContent = hours;
            this.timeDisplayElement.querySelector('.minutes').textContent = minutes;
            this.timeDisplayElement.querySelector('.seconds').textContent = seconds;
            this.msDisplayElement.textContent = formattedMs;
            console.debug(`[DisplayManager] Display updated to ${formattedTime}.${formattedMs}`);
        } catch (error) {
            console.error(`[DisplayManager Error] Failed to update display for ${ms}ms:`, error);
        }
    }

    /**
     * Resets the display to 00:00:00.000.
     */
    clear() {
        this.update(0);
        console.log("[DisplayManager] Display cleared.");
    }
}

/**
 * StopwatchLogic Class: Manages the core logic of a stopwatch.
 * Adheres to SRP.
 */
class StopwatchLogic {
    constructor(displayManager, startPauseButton, clearButton) {
        if (!displayManager || !startPauseButton || !clearButton) {
            throw new Error("[StopwatchLogic] Required dependencies are missing.");
        }
        this.displayManager = displayManager;
        this.startPauseButton = startPauseButton;
        this.clearButton = clearButton;

        this.timer = null;
        this.elapsedTime = 0;
        this.startTime = 0;
        this.isRunning = false;

        this._setupEventListeners();
        console.log("[StopwatchLogic] Initialized.");
    }

    _setupEventListeners() {
        try {
            this.startPauseButton.addEventListener('click', () => this.toggleStartPause());
            this.clearButton.addEventListener('click', () => this.clear());
            console.log("[StopwatchLogic] Event listeners set up.");
        } catch (error) {
            console.error("[StopwatchLogic Error] Failed to set up event listeners:", error);
        }
    }

    toggleStartPause() {
        try {
            if (this.isRunning) {
                this.pause();
                console.log("[StopwatchLogic] Paused.");
            } else {
                this.start();
                console.log("[StopwatchLogic] Started.");
            }
        } catch (error) {
            console.error("[StopwatchLogic Error] Failed to toggle start/pause:", error);
        }
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.startPauseButton.textContent = 'Pause';
        this.startPauseButton.classList.remove('start');
        this.startPauseButton.classList.add('pause');

        this.timer = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.displayManager.update(this.elapsedTime);
        }, 10); // Update every 10ms for milliseconds accuracy
        console.log("[StopwatchLogic] Timer started.");
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.timer);
        this.startPauseButton.textContent = 'Start';
        this.startPauseButton.classList.remove('pause');
        this.startPauseButton.classList.add('start');
        console.log("[StopwatchLogic] Timer paused.");
    }

    clear() {
        try {
            this.pause(); // Ensure timer is stopped
            this.elapsedTime = 0;
            this.displayManager.clear();
            this.startPauseButton.textContent = 'Start';
            this.startPauseButton.classList.remove('pause');
            this.startPauseButton.classList.add('start');
            console.log("[StopwatchLogic] Cleared.");
        } catch (error) {
            console.error("[StopwatchLogic Error] Failed to clear stopwatch:", error);
        }
    }

    reset() {
        this.clear(); // Provides a clean state when switching screens
        console.log("[StopwatchLogic] State reset.");
    }
}

/**
 * CountdownInputManager Class: Handles number input for countdown.
 * Adheres to SRP.
 */
class CountdownInputManager {
    constructor(displayManager, keypadButtons, setButton, clearInputButton) {
        if (!displayManager || !keypadButtons || !setButton || !clearInputButton) {
            throw new Error("[CountdownInputManager] Required dependencies are missing.");
        }
        this.displayManager = displayManager;
        this.keypadButtons = keypadButtons;
        this.setButton = setButton;
        this.clearInputButton = clearInputButton;

        this.inputMs = 0; // Stores the current input in milliseconds
        this.onSetCallback = () => console.warn("[CountdownInputManager] onSetCallback not set.");

        this._setupEventListeners();
        this.displayManager.update(0); // Initialize display
        console.log("[CountdownInputManager] Initialized.");
    }

    _setupEventListeners() {
        try {
            this.keypadButtons.forEach(button => {
                button.addEventListener('click', (event) => this.handleNumberInput(event.target.textContent));
            });
            this.setButton.addEventListener('click', () => this.triggerSet());
            this.clearInputButton.addEventListener('click', () => this.clearInput());
            console.log("[CountdownInputManager] Event listeners set up.");
        } catch (error) {
            console.error("[CountdownInputManager Error] Failed to set up event listeners:", error);
        }
    }

    /**
     * Handles numerical input from the keypad.
     * Limits input to 6 digits (HHMMSS representation).
     * Converts input to milliseconds and updates display.
     * Enforces the 24-hour limit.
     * @param {string} digit - The digit pressed (0-9).
     */
    handleNumberInput(digit) {
        try {
            if (!/^\d$/.test(digit)) {
                console.warn(`[CountdownInputManager] Invalid input: ${digit}`);
                return;
            }

            // Convert current inputMs to a number string for manipulation
            let currentNumString = Math.floor(this.inputMs / MS_PER_SECOND) // Get total seconds
                                    .toString()
                                    .padStart(6, '0'); // Pad to 6 digits (HHMMSS)

            // Append new digit and shift existing digits left
            let newNumString = (currentNumString.slice(-5) + digit); // Take last 5 and append new digit

            // Convert back to seconds
            const newSeconds = parseInt(newNumString.slice(-2)); // Last two digits are seconds
            const newMinutes = parseInt(newNumString.slice(-4, -2)); // Middle two digits are minutes
            const newHours = parseInt(newNumString.slice(0, -4)); // First two digits are hours

            // Validate against 24-hour limit (23:59:59)
            if (newHours > 23 || newMinutes > 59 || newSeconds > 59) {
                console.warn(`[CountdownInputManager] Input exceeds 24-hour limit or invalid time: ${newHours}:${newMinutes}:${newSeconds}`);
                // If it exceeds, don't update inputMs, just keep the old value
                return;
            }

            this.inputMs = (newHours * MS_PER_HOUR) + (newMinutes * MS_PER_MINUTE) + (newSeconds * MS_PER_SECOND);

            if (this.inputMs > MAX_COUNTDOWN_MS) {
                this.inputMs = MAX_COUNTDOWN_MS; // Clamp to max valid time
                console.warn(`[CountdownInputManager] Input clamped to maximum: ${MAX_COUNTDOWN_MS}ms`);
            }

            this.displayManager.update(this.inputMs);
            console.log(`[CountdownInputManager] Input updated: ${this.inputMs}ms`);
        } catch (error) {
            console.error("[CountdownInputManager Error] Failed to handle number input:", error);
        }
    }


    clearInput() {
        try {
            this.inputMs = 0;
            this.displayManager.clear();
            console.log("[CountdownInputManager] Input cleared.");
        } catch (error) {
            console.error("[CountdownInputManager Error] Failed to clear input:", error);
        }
    }

    /**
     * Sets a callback function to be executed when the 'Set' button is pressed.
     * @param {function(number)} callback - The function to call with the set milliseconds.
     */
    onSet(callback) {
        if (typeof callback === 'function') {
            this.onSetCallback = callback;
            console.log("[CountdownInputManager] onSet callback registered.");
        } else {
            console.error("[CountdownInputManager Error] onSet expects a function.");
        }
    }

    triggerSet() {
        try {
            if (this.inputMs > 0) { // Only trigger set if a time has been input
                 this.onSetCallback(this.inputMs);
                 console.log(`[CountdownInputManager] Set button triggered with ${this.inputMs}ms.`);
            } else {
                console.warn("[CountdownInputManager] Set button pressed, but no time was input.");
            }
        } catch (error) {
            console.error("[CountdownInputManager Error] Failed to trigger set:", error);
        }
    }

    reset() {
        this.clearInput(); // Ensures input is clear when form is shown
        console.log("[CountdownInputManager] State reset.");
    }
}

/**
 * CountdownLogic Class: Manages the core logic of a countdown timer.
 * Adheres to SRP.
 */
class CountdownLogic {
    constructor(displayManager, startPauseContinueButton, clearButton) {
        if (!displayManager || !startPauseContinueButton || !clearButton) {
            throw new Error("[CountdownLogic] Required dependencies are missing.");
        }
        this.displayManager = displayManager;
        this.startPauseContinueButton = startPauseContinueButton;
        this.clearButton = clearButton;

        this.timer = null;
        this.initialTimeMs = 0; // Time set by the user
        this.remainingTime = 0; // Time currently remaining
        this.endTime = 0; // Target end time for accurate countdown
        this.isRunning = false;

        this._setupEventListeners();
        console.log("[CountdownLogic] Initialized.");
    }

    _setupEventListeners() {
        try {
            this.startPauseContinueButton.addEventListener('click', () => this.toggleStartPauseContinue());
            this.clearButton.addEventListener('click', () => this.clear());
            console.log("[CountdownLogic] Event listeners set up.");
        } catch (error) {
            console.error("[CountdownLogic Error] Failed to set up event listeners:", error);
        }
    }

    /**
     * Sets the initial countdown time.
     * @param {number} ms - Initial time in milliseconds.
     */
    setInitialTime(ms) {
        try {
            this.initialTimeMs = ms;
            this.remainingTime = ms;
            this.displayManager.update(this.remainingTime);
            this._updateButtonState('start');
            console.log(`[CountdownLogic] Initial time set to ${ms}ms.`);
        } catch (error) {
            console.error(`[CountdownLogic Error] Failed to set initial time ${ms}:`, error);
        }
    }

    toggleStartPauseContinue() {
        try {
            if (this.isRunning) {
                this.pause();
                console.log("[CountdownLogic] Paused.");
            } else if (this.startPauseContinueButton.textContent === 'Start') {
                this.start();
                console.log("[CountdownLogic] Started.");
            } else { // Must be 'Continue'
                this.continueCountdown();
                console.log("[CountdownLogic] Continued.");
            }
        } catch (error) {
            console.error("[CountdownLogic Error] Failed to toggle start/pause/continue:", error);
        }
    }

    start() {
        if (this.isRunning || this.remainingTime <= 0) {
            if (this.remainingTime <= 0) console.warn("[CountdownLogic] Cannot start countdown, time is 0.");
            return;
        }

        this.isRunning = true;
        this.endTime = Date.now() + this.remainingTime;
        this._updateButtonState('pause');

        this.timer = setInterval(() => {
            const now = Date.now();
            this.remainingTime = this.endTime - now;

            if (this.remainingTime <= 0) {
                this.remainingTime = 0;
                this.pause(); // Stop timer
                this.displayManager.update(0);
                this._updateButtonState('start'); // Reset button to Start
                console.log("[CountdownLogic] Countdown finished.");
                // Optionally add a sound or visual alert here
            } else {
                this.displayManager.update(this.remainingTime);
            }
        }, 10); // Update every 10ms for milliseconds accuracy
        console.log("[CountdownLogic] Countdown timer started.");
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.timer);
        this._updateButtonState('continue');
        console.log("[CountdownLogic] Countdown timer paused.");
    }

    continueCountdown() {
        if (this.isRunning || this.remainingTime <= 0) {
            if (this.remainingTime <= 0) console.warn("[CountdownLogic] Cannot continue countdown, time is 0.");
            return;
        }
        this.start(); // Reuse start logic for continuation
        console.log("[CountdownLogic] Countdown continued.");
    }

    clear() {
        try {
            this.pause(); // Stop timer
            this.remainingTime = this.initialTimeMs; // Reset to initial set time
            this.displayManager.update(this.remainingTime);
            this._updateButtonState('start');
            console.log("[CountdownLogic] Cleared and reset to initial time.");
        } catch (error) {
            console.error("[CountdownLogic Error] Failed to clear countdown:", error);
        }
    }

    /**
     * Updates the state of the start/pause/continue button.
     * @param {'start' | 'pause' | 'continue'} state
     */
    _updateButtonState(state) {
        this.startPauseContinueButton.classList.remove('start', 'pause');
        this.startPauseContinueButton.textContent = ''; // Clear text first

        if (state === 'start') {
            this.startPauseContinueButton.textContent = 'Start';
            this.startPauseContinueButton.classList.add('start');
        } else if (state === 'pause') {
            this.startPauseContinueButton.textContent = 'Pause';
            this.startPauseContinueButton.classList.add('pause');
        } else if (state === 'continue') {
            this.startPauseContinueButton.textContent = 'Continue';
            this.startPauseContinueButton.classList.add('start'); // Use 'start' class for green color
        }
        console.debug(`[CountdownLogic] Button state updated to: ${state}`);
    }

    reset() {
        this.pause();
        this.initialTimeMs = 0;
        this.remainingTime = 0;
        this.displayManager.clear();
        this._updateButtonState('start');
        console.log("[CountdownLogic] State reset.");
    }
}


/**
 * AppRouter Class: Manages screen visibility and transitions.
 * Adheres to SRP (for routing) and coordinates other modules (DIP).
 */
class AppRouter {
    constructor(screens) {
        if (!screens || Object.keys(screens).length === 0) {
            throw new Error("[AppRouter] No screens provided.");
        }
        this.screens = screens; // Map of screenId -> screenElement
        this.currentScreenId = 'selection-screen'; // Default starting screen
        this._setupBackButtons();
        this.showScreen(this.currentScreenId); // Ensure initial screen is visible
        console.log("[AppRouter] Initialized.");
    }

    /**
     * Shows a specific screen and hides others.
     * @param {string} screenId - The ID of the screen to show.
     * @param {function} [onTransitionEnd] - Optional callback after transition.
     */
    showScreen(screenId, onTransitionEnd = () => {}) {
        if (!this.screens[screenId]) {
            console.error(`[AppRouter Error] Screen ID "${screenId}" not found.`);
            return;
        }

        try {
            console.log(`[AppRouter] Transitioning from "${this.currentScreenId}" to "${screenId}"`);

            // Hide current screen (if different) with animation
            if (this.currentScreenId && this.currentScreenId !== screenId) {
                const currentScreen = this.screens[this.currentScreenId];
                if (currentScreen) {
                    currentScreen.classList.remove('active');
                    currentScreen.classList.add('hidden'); // Immediately hide for faster display update
                    // No complex CSS transitions for hiding as we want it quick for SPA feel
                }
            }

            // Show new screen
            const nextScreen = this.screens[screenId];
            nextScreen.classList.remove('hidden');
            nextScreen.classList.add('active'); // Trigger fadeIn animation via CSS

            this.currentScreenId = screenId;
            console.log(`[AppRouter] Current screen set to "${screenId}".`);
            onTransitionEnd(); // Callback can be used for logic that depends on screen being visible
        } catch (error) {
            console.error(`[AppRouter Error] Failed to show screen "${screenId}":`, error);
        }
    }

    _setupBackButtons() {
        try {
            getAllElements('.back-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const targetScreenId = button.dataset.targetScreen || 'selection-screen';
                    this.showScreen(targetScreenId);
                    console.log(`[AppRouter] Back button pressed, navigating to "${targetScreenId}".`);
                    // Signal to other modules to reset their state
                    document.dispatchEvent(new CustomEvent('screenChange', { detail: { screenId: targetScreenId } }));
                });
            });
            console.log("[AppRouter] Back buttons set up.");
        } catch (error) {
            console.error("[AppRouter Error] Failed to set up back buttons:", error);
        }
    }
}


// --- APPLICATION BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[App] DOM Content Loaded. Initializing application...");

    try {
        // 1. Get all necessary DOM elements
        const selectionScreen = getElement('#selection-screen');
        const stopwatchOptionBtn = getElement('#stopwatch-option');
        const countdownOptionBtn = getElement('#countdown-option');

        // Stopwatch elements
        const stopwatchForm = getElement('#stopwatch-form');
        const stopwatchTimeDisplayEl = stopwatchForm ? stopwatchForm.querySelector('.time-display') : null;
        const stopwatchMsDisplayEl = stopwatchForm ? stopwatchForm.querySelector('.milliseconds-display .milliseconds') : null;
        const stopwatchStartPauseBtn = getElement('#stopwatch-start-pause');
        const stopwatchClearBtn = getElement('#stopwatch-clear');

        // Countdown input elements
        const countdownInputForm = getElement('#countdown-input-form');
        const countdownInputTimeDisplayEl = countdownInputForm ? countdownInputForm.querySelector('.time-display') : null;
        const countdownInputMsDisplayEl = countdownInputForm ? countdownInputForm.querySelector('.milliseconds-display .milliseconds') : null;
        const countdownKeypadButtons = getAllElements('#countdown-input-form .keypad-button');
        const countdownSetBtn = getElement('#countdown-set');
        const countdownClearInputBtn = getElement('#countdown-clear-input');

        // Countdown display elements
        const countdownDisplayForm = getElement('#countdown-display-form');
        const countdownDisplayTimeDisplayEl = countdownDisplayForm ? countdownDisplayForm.querySelector('.time-display') : null;
        const countdownDisplayMsDisplayEl = countdownDisplayForm ? countdownDisplayForm.querySelector('.milliseconds-display .milliseconds') : null;
        const countdownStartPauseContinueBtn = getElement('#countdown-start-pause-continue');
        const countdownClearDisplayBtn = getElement('#countdown-clear-display');

        // Check if all critical elements are found
        const criticalElements = {
            selectionScreen, stopwatchOptionBtn, countdownOptionBtn, stopwatchForm,
            stopwatchTimeDisplayEl, stopwatchMsDisplayEl, stopwatchStartPauseBtn, stopwatchClearBtn,
            countdownInputForm, countdownInputTimeDisplayEl, countdownInputMsDisplayEl,
            countdownSetBtn, countdownClearInputBtn,
            countdownDisplayForm, countdownDisplayTimeDisplayEl, countdownDisplayMsDisplayEl,
            countdownStartPauseContinueBtn, countdownClearDisplayBtn
        };

        for (const key in criticalElements) {
            if (!criticalElements[key] && key !== 'countdownKeypadButtons') { // Keypad buttons can be empty if not yet rendered fully, but their parent should exist
                console.error(`[App Init Error] Missing critical DOM element: ${key}`);
                return; // Stop initialization if critical elements are missing
            }
        }
        if (countdownKeypadButtons.length === 0) {
             console.warn("[App Init Warning] No keypad buttons found for countdown input. Check selectors.");
        }


        // 2. Initialize Managers and Logics
        const screens = {
            'selection-screen': selectionScreen,
            'stopwatch-form': stopwatchForm,
            'countdown-input-form': countdownInputForm,
            'countdown-display-form': countdownDisplayForm
        };
        const appRouter = new AppRouter(screens);
        console.log("[App] AppRouter initialized.");

        // Stopwatch
        const stopwatchDisplayManager = new DisplayManager(stopwatchTimeDisplayEl, stopwatchMsDisplayEl);
        const stopwatchLogic = new StopwatchLogic(stopwatchDisplayManager, stopwatchStartPauseBtn, stopwatchClearBtn);
        console.log("[App] StopwatchLogic initialized.");

        // Countdown Input
        const countdownInputDisplayManager = new DisplayManager(countdownInputTimeDisplayEl, countdownInputMsDisplayEl);
        const countdownInputManager = new CountdownInputManager(countdownInputDisplayManager, countdownKeypadButtons, countdownSetBtn, countdownClearInputBtn);
        console.log("[App] CountdownInputManager initialized.");

        // Countdown Display
        const countdownDisplayManager = new DisplayManager(countdownDisplayTimeDisplayEl, countdownDisplayMsDisplayEl);
        const countdownLogic = new CountdownLogic(countdownDisplayManager, countdownStartPauseContinueBtn, countdownClearDisplayBtn);
        console.log("[App] CountdownLogic initialized.");


        // 3. Set up global event listeners for screen transitions
        stopwatchOptionBtn.addEventListener('click', () => {
            stopwatchLogic.reset(); // Reset stopwatch state when navigating to it
            appRouter.showScreen('stopwatch-form');
            console.log("[App] Navigated to Stopwatch.");
        });

        countdownOptionBtn.addEventListener('click', () => {
            countdownInputManager.reset(); // Reset countdown input state
            appRouter.showScreen('countdown-input-form');
            console.log("[App] Navigated to Countdown Input.");
        });

        countdownInputManager.onSet((setMs) => {
            try {
                countdownLogic.setInitialTime(setMs);
                appRouter.showScreen('countdown-display-form');
                console.log(`[App] Countdown set to ${setMs}ms and navigated to display.`);
            } catch (error) {
                console.error("[App Error] Error setting countdown initial time:", error);
            }
        });

        // Listen for screen changes to reset module states
        document.addEventListener('screenChange', (event) => {
            const screenId = event.detail.screenId;
            console.log(`[App] Global screenChange event detected: ${screenId}`);
            if (screenId === 'selection-screen') {
                stopwatchLogic.reset();
                countdownLogic.reset(); // Ensure countdown also resets if user goes back from display
                countdownInputManager.reset(); // Ensure input also resets
            }
            // No need to reset if going from countdown input to countdown display
        });

        console.log("[App] Application initialized successfully.");

    } catch (error) {
        console.error("[App Initialization Critical Error]", error);
        alert("A critical error occurred during application startup. Please check the console for details.");
    }
});