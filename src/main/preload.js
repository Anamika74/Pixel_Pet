const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    "petAPI",
    {

        version: "0.5.0",


        /* ==========================================
           MOVEMENT
        ========================================== */

        movePet: (
            deltaX,
            deltaY
        ) => {

            ipcRenderer.send(
                "move-pet",
                {
                    deltaX,
                    deltaY
                }
            );
        },


        getPetPosition: () => {

            return ipcRenderer.invoke(
                "get-pet-position"
            );
        },


        getWorkArea: () => {

            return ipcRenderer.invoke(
                "get-work-area"
            );
        },
        
        setIgnoreMouseEvents: (ignore) =>
    ipcRenderer.send(
        "set-ignore-mouse-events",
        Boolean(ignore)
    ),

        /* ==========================================
           SHOW / HIDE
        ========================================== */

        hidePet: () => {

            ipcRenderer.send(
                "hide-pet"
            );
        },


        showPet: () => {

            ipcRenderer.send(
                "show-pet"
            );
        },


        /* ==========================================
           PAUSE
        ========================================== */

        pause: () => {

            ipcRenderer.send(
                "set-paused",
                true
            );
        },


        resume: () => {

            ipcRenderer.send(
                "set-paused",
                false
            );
        },


        togglePause: () => {

            ipcRenderer.send(
                "toggle-pause"
            );
        },


        timedPause: (
            minutes
        ) => {

            ipcRenderer.send(
                "timed-pause",
                minutes
            );
        },


        /* ==========================================
           PAUSE EVENTS
        ========================================== */

        onPauseChanged: (
            callback
        ) => {

            ipcRenderer.on(
                "pause-changed",
                (
                    event,
                    paused
                ) => {

                    callback(
                        paused
                    );
                }
            );
        },


        onTimedResume: (
            callback
        ) => {

            ipcRenderer.on(
                "timed-resume",
                () => {

                    callback();
                }
            );
        },


        /*
         * Kept for compatibility with older
         * pet.js code.
         */
        onTogglePause: (
            callback
        ) => {

            ipcRenderer.on(
                "toggle-pause",
                () => {

                    callback();
                }
            );
        },


        /* ==========================================
           SETTINGS
        ========================================== */

        setStartup: (
            enabled
        ) => {

            ipcRenderer.send(
                "set-startup",
                Boolean(enabled)
            );
        },


        setAlwaysOnTop: (
            enabled
        ) => {

            ipcRenderer.send(
                "set-always-on-top",
                Boolean(enabled)
            );
        },


        /* ==========================================
           NOTIFICATIONS
        ========================================== */

        showNotification: (
            title,
            body
        ) => {

            ipcRenderer.send(
                "show-notification",
                {
                    title,
                    body
                }
            );
        },


        /* ==========================================
           SYSTEM IDLE TIME
        ========================================== */

        getSystemIdleTime: () => {

            return ipcRenderer.invoke(
                "get-system-idle-time"
            );
        }
    }
);