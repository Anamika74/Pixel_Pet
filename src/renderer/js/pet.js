console.log("PET.JS IS RUNNING");


/* ==========================================
   DOM
========================================== */

const pet =
    document.getElementById("pet");

const petContainer =
    document.getElementById(
        "pet-container"
    );


/* ==========================================
   SETTINGS
========================================== */

const settingsManager =
    new SettingsManager();


/* ==========================================
   PET ASSETS
========================================== */

const petAssets =
    new PetAssetManager("cat");


/* ==========================================
   ANIMATION
========================================== */

const animationManager =
    new AnimationManager(
        pet,
        petAssets
    );


/* ==========================================
   STATS
========================================== */

const statsManager =
    new StatsManager();


/* ==========================================
   MOVEMENT
========================================== */

const movementManager =
    new MovementManager(
        animationManager
    );


/* ==========================================
   BEHAVIOR
========================================== */

const behaviorManager =
    new BehaviorManager(
        animationManager,
        statsManager
    );


/* ==========================================
   STATE
========================================== */

const stateManager =
    new StateManager(
        animationManager
    );


/* ==========================================
   INTERACTION
========================================== */

const interactionManager =
    new InteractionManager(
        stateManager,
        animationManager,
        movementManager,
        behaviorManager,
        statsManager
    );


/* ==========================================
   MESSAGES
========================================== */

const messageManager =
    new MessageManager();


/* ==========================================
   BREAK SYSTEM
========================================== */

const breakManager =
    new BreakManager(
        stateManager,
        messageManager,
        settingsManager
    );


/* ==========================================
   CONNECT MANAGERS
========================================== */

behaviorManager.setStateManager(
    stateManager
);

behaviorManager.setMovementManager(
    movementManager
);


/* ==========================================
   STATS HUD
========================================== */

const happinessBar =
    document.getElementById(
        "happiness-bar"
    );

const happinessValue =
    document.getElementById(
        "happiness-value"
    );

const energyBar =
    document.getElementById(
        "energy-bar"
    );

const energyValue =
    document.getElementById(
        "energy-value"
    );


function updateStatsHUD(
    stats
) {

    if (!stats) {
        return;
    }


    happinessBar.style.width =
        `${stats.happiness}%`;

    happinessValue.textContent =
        stats.happiness;


    energyBar.style.width =
        `${stats.energy}%`;

    energyValue.textContent =
        stats.energy;
}

// --------------------------------------------------
// CLICK-THROUGH MOUSE BEHAVIOR
// --------------------------------------------------

let mouseEventsIgnored = true;

function setPetMouseInteraction(interactive) {
    const shouldIgnore = !interactive;

    // Don't repeatedly send the same IPC message.
    if (mouseEventsIgnored === shouldIgnore) {
        return;
    }

    mouseEventsIgnored = shouldIgnore;

    window.petAPI.setIgnoreMouseEvents(
        shouldIgnore
    );
}

// Cursor enters the actual cat
pet.addEventListener("mouseenter", () => {
    console.log("Mouse entered pet");

    setPetMouseInteraction(true);
});

// Cursor leaves the actual cat
pet.addEventListener("mouseleave", () => {
    console.log("Mouse left pet");

    setPetMouseInteraction(false);
});

/*
 * ONE stats subscription.
 */

statsManager.subscribe(
    (stats) => {

        updateStatsHUD(
            stats
        );


        /*
         * Stats affect autonomous
         * behavior only when enabled.
         */

        if (
            settingsManager.get(
                "moodBehavior"
            )
        ) {

            behaviorManager.onStatsChanged(
                stats
            );
        }
    }
);


/*
 * Initial HUD.
 */

updateStatsHUD(
    statsManager.getStats()
);


/* ==========================================
   INTERACTION MENU
========================================== */

const interactionMenu =
    document.getElementById(
        "interaction-menu"
    );


function closeInteractionMenu() {

    interactionMenu.classList.remove(
        "visible"
    );
}


function openInteractionMenu(
    x,
    y
) {

    interactionMenu.style.left =
        `${x}px`;

    interactionMenu.style.top =
        `${y}px`;

    interactionMenu.classList.add(
        "visible"
    );
}


/*
 * Right click.
 */

pet.addEventListener(
    "contextmenu",
    (event) => {
        window.petAPI.setIgnoreMouseEvents(false);
mouseEventsIgnored = false;
        event.preventDefault();

        openInteractionMenu(
            event.clientX,
            event.clientY
        );
    }
);


/* ==========================================
   SETTINGS PANEL
========================================== */

const settingsPanel =
    document.getElementById(
        "settings-panel"
    );

const closeSettings =
    document.getElementById(
        "close-settings"
    );

const resetSettings =
    document.getElementById(
        "reset-settings"
    );

const settingStartup =
    document.getElementById(
        "setting-startup"
    );

const settingAlwaysOnTop =
    document.getElementById(
        "setting-always-on-top"
    );

const settingRandomMessages =
    document.getElementById(
        "setting-random-messages"
    );

const settingBreakReminders =
    document.getElementById(
        "setting-break-reminders"
    );

const settingNotifications =
    document.getElementById(
        "setting-notifications"
    );

const settingMoodBehavior =
    document.getElementById(
        "setting-mood-behavior"
    );


function loadSettingsUI() {

    const settings =
        settingsManager.getAll();


    settingStartup.checked =
        settings.startup;

    settingAlwaysOnTop.checked =
        settings.alwaysOnTop;

    settingRandomMessages.checked =
        settings.randomMessages;

    settingBreakReminders.checked =
        settings.breakReminders;

    settingNotifications.checked =
        settings.notifications;

    settingMoodBehavior.checked =
        settings.moodBehavior;
}


function openSettings() {

    loadSettingsUI();

    settingsPanel.classList.add(
        "visible"
    );
}


function closeSettingsPanel() {

    settingsPanel.classList.remove(
        "visible"
    );
}


closeSettings.addEventListener(
    "click",
    closeSettingsPanel
);


/* ==========================================
   SETTINGS EVENTS
========================================== */

settingStartup.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "startup",
            settingStartup.checked
        );
    }
);


settingAlwaysOnTop.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "alwaysOnTop",
            settingAlwaysOnTop.checked
        );
    }
);


settingRandomMessages.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "randomMessages",
            settingRandomMessages.checked
        );


        if (
            settingRandomMessages.checked
        ) {

            messageManager.startRandomMessages();

        } else {

            messageManager.stopRandomMessages();
        }
    }
);


settingBreakReminders.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "breakReminders",
            settingBreakReminders.checked
        );


        if (
            settingBreakReminders.checked
        ) {

            breakManager.start();

        } else {

            breakManager.stop();
        }
    }
);


settingNotifications.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "notifications",
            settingNotifications.checked
        );
    }
);


settingMoodBehavior.addEventListener(
    "change",
    () => {

        settingsManager.set(
            "moodBehavior",
            settingMoodBehavior.checked
        );


        if (
            settingMoodBehavior.checked
        ) {

            behaviorManager.start();
        }
    }
);


resetSettings.addEventListener(
    "click",
    () => {

        settingsManager.reset();

        loadSettingsUI();

        /*
         * Restart systems according
         * to the reset values.
         */

        if (
            settingsManager.get(
                "randomMessages"
            )
        ) {

            messageManager.startRandomMessages();

        } else {

            messageManager.stopRandomMessages();
        }


        if (
            settingsManager.get(
                "breakReminders"
            )
        ) {

            breakManager.start();

        } else {

            breakManager.stop();
        }


        if (
            settingsManager.get(
                "moodBehavior"
            )
        ) {

            behaviorManager.start();
        }
    }
);


/* ==========================================
   MENU ACTIONS
========================================== */

interactionMenu.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        switch (action) {

            case "pet":

                interactionManager.pet();

                break;


            case "feed":

                interactionManager.feed();

                break;


            case "play":

                interactionManager.play();

                break;


            case "pause":

                togglePause();

                break;


            case "hide":

                window.petAPI.hidePet();

                break;


            case "pause10":

                window.petAPI.timedPause(
                    10
                );

                break;


            case "pause30":

                window.petAPI.timedPause(
                    30
                );

                break;


            case "settings":

                openSettings();

                break;
        }


        closeInteractionMenu();
    }
);


/*
 * Click outside menu.
 */

document.addEventListener(
    "click",
    (event) => {

        if (
            !interactionMenu.contains(
                event.target
            )
        ) {

            closeInteractionMenu();
        }
    }
);


/* ==========================================
   PAUSE / RESUME
========================================== */

function pausePet() {

    if (
        stateManager.paused
    ) {
        return;
    }


    console.log(
        "Pausing pet..."
    );


    /*
     * Stop movement.
     */

    if (
        typeof movementManager.stopMovement ===
        "function"
    ) {

        movementManager.stopMovement();
    }


    /*
     * Clear movement timers.
     */

    if (
        typeof movementManager.clearTimers ===
        "function"
    ) {

        movementManager.clearTimers();
    }


    /*
     * Stop autonomous behavior.
     */

    behaviorManager.clearTimers();


    /*
     * Stop interaction.
     */

    if (
        typeof interactionManager.clearTimers ===
        "function"
    ) {

        interactionManager.clearTimers();
    }


    /*
     * Stop blinking.
     */

    animationManager.stopBlinking();


    /*
     * Pause state.
     */

    stateManager.pause();


    console.log(
        "PET PAUSED"
    );
}


function resumePet() {

    if (
        !stateManager.paused
    ) {
        return;
    }


    console.log(
        "Resuming pet..."
    );


    /*
     * Resume state machine.
     */

    stateManager.resume();


    /*
     * Restart blinking.
     */

    animationManager.startBlinking();


    /*
     * Restart movement.
     */

    movementManager.scheduleNextWalk();


    /*
     * Restart behavior.
     */

    if (
        settingsManager.get(
            "moodBehavior"
        )
    ) {

        behaviorManager.start();
    }


    console.log(
        "PET RESUMED"
    );
}


function togglePause() {

    if (
        stateManager.paused
    ) {

        window.petAPI.resume();

    } else {

        window.petAPI.pause();
    }
}


/* ==========================================
   ELECTRON PAUSE EVENTS
========================================== */

function applyPauseState(
    paused
) {

    if (paused) {

        pausePet();

    } else {

        resumePet();
    }
}


window.petAPI.onPauseChanged(
    (paused) => {

        applyPauseState(
            paused
        );
    }
);


/* ==========================================
   TIMED RESUME
========================================== */

/*
 * We keep this only as a safety
 * callback. The actual pause state
 * comes through onPauseChanged().
 */

window.petAPI.onTimedResume(
    () => {

        if (
            stateManager.paused
        ) {

            window.petAPI.resume();
        }
    }
);


/* ==========================================
   KEYBOARD CONTROLS
========================================== */

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * SPACE
         * Pause / Resume
         */

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            togglePause();

            return;
        }


        /*
         * H
         * Hide pet
         *
         * This remains available
         * even while paused.
         */

        if (
            event.key.toLowerCase() ===
            "h"
        ) {

            window.petAPI.hidePet();

            return;
        }


        /*
         * Ignore action keys
         * while paused.
         */

        if (
            stateManager.paused
        ) {
            return;
        }


        /*
         * F
         * Feed
         */

        if (
            event.key.toLowerCase() ===
            "f"
        ) {

            interactionManager.feed();

            return;
        }


        /*
         * P
         * Play
         */

        if (
            event.key.toLowerCase() ===
            "p"
        ) {

            interactionManager.play();

            return;
        }


        /*
         * T
         * Pet
         */

        if (
            event.key.toLowerCase() ===
            "t"
        ) {

            interactionManager.pet();

            return;
        }


        /*
         * ESC
         * Stop current interaction
         */

        if (
            event.key ===
            "Escape"
        ) {

            if (
                typeof interactionManager.stopInteraction ===
                "function"
            ) {

                interactionManager.stopInteraction();
            }

            return;
        }
    }
);


/* ==========================================
   CLICK CAT → PET
========================================== */

pet.addEventListener(
    "click",
    (event) => {

        if (
            isDragging
        ) {
            return;
        }


        interactionManager.pet();
    }
);


/* ==========================================
   GLOBAL ELECTRON PAUSE
========================================== */

window.petAPI.onTogglePause(
    () => {

        togglePause();
    }
);


/* ==========================================
   DRAGGING
========================================== */

let isDragging =
    false;

let dragStartX =
    0;

let dragStartY =
    0;

let lastMouseX =
    0;

let lastMouseY =
    0;


/*
 * Mouse down
 */

pet.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 0
        ) {
            return;
        }


        isDragging =
            false;


        dragStartX =
            event.clientX;

        dragStartY =
            event.clientY;


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;
    window.petAPI.setIgnoreMouseEvents(false);
mouseEventsIgnored = false;
    }
);


/*
 * Mouse move
 */

document.addEventListener(
    "mousemove",
    (event) => {

        if (
            event.buttons !== 1
        ) {
            return;
        }


        const deltaX =
            event.clientX -
            lastMouseX;


        const deltaY =
            event.clientY -
            lastMouseY;


        const totalDistance =
            Math.abs(
                event.clientX -
                dragStartX
            ) +
            Math.abs(
                event.clientY -
                dragStartY
            );


        if (
            totalDistance > 4
        ) {

            isDragging =
                true;
        }


        if (
            isDragging
        ) {

            window.petAPI.movePet(
                deltaX,
                deltaY
            );
        }


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;
    }
);


/*
 * Mouse up
 */

document.addEventListener(
    "mouseup",
    () => {
        window.petAPI.setIgnoreMouseEvents(true);
mouseEventsIgnored = true;
        setTimeout(
            () => {

                isDragging =
                    false;

            },
            50
        );
    }
);


/* ==========================================
   INITIAL POSITION
========================================== */

async function initializePetPosition() {

    try {

        const position =
            await window.petAPI
                .getPetPosition();


        console.log(
            "Pet position:",
            position
        );

    } catch (error) {

        console.error(
            "Could not get pet position:",
            error
        );
    }
}


initializePetPosition();


/* ==========================================
   START PET
========================================== */

function startPet() {

    console.log(
        "Starting Pixel Pet..."
    );


    /*
     * Initial animation.
     */

    animationManager.play(
        "idle"
    );


    /*
     * Blinking.
     */

    animationManager.startBlinking();


    /*
     * Movement.
     */

    movementManager.scheduleNextWalk();


    /*
     * Autonomous behavior.
     */

    if (
        settingsManager.get(
            "moodBehavior"
        )
    ) {

        behaviorManager.start();
    }


    /*
     * Initial greeting.
     */

    setTimeout(
        () => {

            messageManager.show(
                "Hey! I'm your Pixel Pet."
            );

        },
        1200
    );


    /*
     * Random messages.
     */

    if (
        settingsManager.get(
            "randomMessages"
        )
    ) {

        messageManager.startRandomMessages();
    }


    /*
     * Break reminders.
     */

    if (
        settingsManager.get(
            "breakReminders"
        )
    ) {

        breakManager.start();
    }


    /*
     * Load settings UI.
     */

    loadSettingsUI();


    console.log(
        "Pet startup complete"
    );
}


startPet();


/* ==========================================
   DEBUG HELPERS
========================================== */

window.petDebug = {

    pause() {

        window.petAPI.pause();
    },


    resume() {

        window.petAPI.resume();
    },


    togglePause() {

        togglePause();
    },


    feed() {

        interactionManager.feed();
    },


    play() {

        interactionManager.play();
    },


    pet() {

        interactionManager.pet();
    },


    stats() {

        console.log(
            statsManager.getStats()
        );
    },


    mood() {

        console.log(
            "Current mood:",
            behaviorManager.getMood()
        );
    },


    resetStats() {

        statsManager.reset();

        console.log(
            "Stats reset:",
            statsManager.getStats()
        );
    },


    decreaseHappiness() {

        statsManager.changeHappiness(
            -10
        );

        console.log(
            "DEBUG: Happiness decreased by 10"
        );
    },


    decreaseEnergy() {

        statsManager.changeEnergy(
            -10
        );

        console.log(
            "DEBUG: Energy decreased by 10"
        );
    },


    state() {

        console.log(
            "Current state:",
            stateManager.state
        );

        console.log(
            "Previous state:",
            stateManager.previousState
        );

        console.log(
            "Paused:",
            stateManager.paused
        );
    }
};