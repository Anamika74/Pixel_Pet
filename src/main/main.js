
const {
    app,
    BrowserWindow,
    ipcMain,
    screen,
    globalShortcut,
    Tray,
    Menu,
    nativeImage,
    Notification,
    powerMonitor
} = require("electron");

const path = require("path");

let petWindow = null;
let tray = null;

let petPaused = false;
let timedPauseTimer = null;


/* PET WINDOW */

function createPetWindow() {
    petWindow = new BrowserWindow({
        width: 180,
        height: 180,
        frame: false,
        transparent: true,
        backgroundColor: "#00000000",
        resizable: false,
        alwaysOnTop: false,
        hasShadow: false,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    petWindow.setIgnoreMouseEvents(true, {
    forward: true
});
    petWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
    );

    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    const [windowWidth, windowHeight] =
        petWindow.getSize();

    const startX =
        workArea.x +
        workArea.width -
        windowWidth -
        40;

    const startY =
        workArea.y +
        workArea.height -
        windowHeight -
        40;

    petWindow.setPosition(startX, startY);

    petWindow.on("closed", () => {
        petWindow = null;
    });
}


/* PAUSE */

function clearTimedPause() {
    if (timedPauseTimer) {
        clearTimeout(timedPauseTimer);
        timedPauseTimer = null;
    }
}

function sendPauseState() {
    if (
        petWindow &&
        !petWindow.isDestroyed()
    ) {
        petWindow.webContents.send(
            "pause-changed",
            petPaused
        );
    }

    updateTrayMenu();
}

function setPaused(paused) {
    petPaused = Boolean(paused);
    sendPauseState();
}

function startTimedPause(minutes) {
    const numericMinutes = Number(minutes);

    if (
        !Number.isFinite(numericMinutes) ||
        numericMinutes <= 0
    ) {
        console.warn(
            "Invalid timed pause:",
            minutes
        );
        return;
    }

    clearTimedPause();

    petPaused = true;
    sendPauseState();

    console.log(
        `Pet paused for ${numericMinutes} minute(s).`
    );

    timedPauseTimer = setTimeout(() => {
        timedPauseTimer = null;

        petPaused = false;
        sendPauseState();

        if (
            petWindow &&
            !petWindow.isDestroyed()
        ) {
            petWindow.show();

            /*
             * Kept for compatibility with the current
             * pet.js. Its onTimedResume handler can call
             * resume() safely; the pause state is already false.
             */
            petWindow.webContents.send(
                "timed-resume"
            );
        }

        console.log(
            "Timed pause finished."
        );
    }, numericMinutes * 60 * 1000);
}


/* PET POSITION */
ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
    const win = BrowserWindow.fromWebContents(event.sender);

    if (!win || win.isDestroyed()) {
        return;
    }

    win.setIgnoreMouseEvents(Boolean(ignore), {
        forward: true
    });
});


ipcMain.handle(
    "get-pet-position",
    () => {
        if (
            !petWindow ||
            petWindow.isDestroyed()
        ) {
            return {
                x: 0,
                y: 0,
                width: 180,
                height: 180
            };
        }

        const [x, y] = petWindow.getPosition();
        const [width, height] = petWindow.getSize();

        return {
            x,
            y,
            width,
            height
        };
    }
);


/* WORK AREA */

ipcMain.handle(
    "get-work-area",
    () => {
        if (
            !petWindow ||
            petWindow.isDestroyed()
        ) {
            return screen
                .getPrimaryDisplay()
                .workArea;
        }

        const bounds = petWindow.getBounds();
        const display = screen.getDisplayMatching(bounds);

        return display.workArea;
    }
);


/* MOVEMENT */

ipcMain.on(
    "move-pet",
    (event, { deltaX, deltaY }) => {
        if (
            !petWindow ||
            petWindow.isDestroyed()
        ) {
            return;
        }

        const [currentX, currentY] =
            petWindow.getPosition();

        const [windowWidth, windowHeight] =
            petWindow.getSize();

        const display =
            screen.getDisplayMatching(
                petWindow.getBounds()
            );

        const workArea = display.workArea;

        let newX =
            currentX +
            Math.round(deltaX);

        let newY =
            currentY +
            Math.round(deltaY);

        const allowedOutside = 80;

        const minimumX =
            workArea.x -
            windowWidth +
            allowedOutside;

        const maximumX =
            workArea.x +
            workArea.width -
            allowedOutside;

        const minimumY =
            workArea.y -
            windowHeight +
            allowedOutside;

        const maximumY =
            workArea.y +
            workArea.height -
            allowedOutside;

        newX = Math.max(
            minimumX,
            Math.min(newX, maximumX)
        );

        newY = Math.max(
            minimumY,
            Math.min(newY, maximumY)
        );

        petWindow.setPosition(
            newX,
            newY
        );
    }
);


/* SHOW / HIDE */

ipcMain.on(
    "hide-pet",
    () => {
        if (
            petWindow &&
            !petWindow.isDestroyed()
        ) {
            petWindow.hide();
            console.log("PET HIDDEN");
        }
    }
);

ipcMain.on(
    "show-pet",
    () => {
        if (
            petWindow &&
            !petWindow.isDestroyed()
        ) {
            petWindow.show();
            console.log("PET SHOWN");
        }
    }
);


/* PAUSE IPC */

ipcMain.on(
    "set-paused",
    (event, paused) => {
        const nextPaused = Boolean(paused);

        /*
         * Manual resume cancels any active timed pause.
         */
        if (!nextPaused) {
            clearTimedPause();
        }

        setPaused(nextPaused);

        console.log(
            `Pet paused: ${petPaused}`
        );
    }
);

ipcMain.on(
    "toggle-pause",
    () => {
        if (petPaused) {
            clearTimedPause();
        }

        setPaused(!petPaused);

        console.log(
            `Pet paused: ${petPaused}`
        );
    }
);

ipcMain.on(
    "timed-pause",
    (event, minutes) => {
        startTimedPause(minutes);
    }
);


/* SETTINGS */

ipcMain.on(
    "set-startup",
    (event, enabled) => {
        app.setLoginItemSettings({
            openAtLogin: Boolean(enabled),
            path: process.execPath
        });

        console.log(
            `Startup: ${Boolean(enabled)}`
        );
    }
);

ipcMain.on(
    "set-always-on-top",
    (event, enabled) => {
        if (
            !petWindow ||
            petWindow.isDestroyed()
        ) {
            return;
        }

        petWindow.setAlwaysOnTop(
            Boolean(enabled)
        );

        console.log(
            `Always on top: ${Boolean(enabled)}`
        );
    }
);


/* NOTIFICATIONS */

ipcMain.on(
    "show-notification",
    (event, data = {}) => {
        if (!Notification.isSupported()) {
            console.log(
                "Notifications are not supported."
            );
            return;
        }

        new Notification({
            title:
                data.title ||
                "Pixel Pet",

            body:
                data.body ||
                ""
        }).show();
    }
);


/* SYSTEM IDLE TIME */

ipcMain.handle(
    "get-system-idle-time",
    () => {
        return powerMonitor.getSystemIdleTime();
    }
);


/* TRAY */

function createTray() {
    const iconSvg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
        >
            <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="5"
                fill="#392b35"
            />

            <rect
                x="7"
                y="10"
                width="18"
                height="14"
                fill="#e7aa7b"
            />

            <rect
                x="8"
                y="6"
                width="6"
                height="7"
                fill="#d89568"
            />

            <rect
                x="18"
                y="6"
                width="6"
                height="7"
                fill="#d89568"
            />

            <rect
                x="10"
                y="14"
                width="4"
                height="5"
                fill="#392b35"
            />

            <rect
                x="18"
                y="14"
                width="4"
                height="5"
                fill="#392b35"
            />

            <rect
                x="14"
                y="20"
                width="4"
                height="3"
                fill="#ff8fa5"
            />
        </svg>
    `;

    const icon =
        nativeImage.createFromDataURL(
            "data:image/svg+xml;base64," +
            Buffer.from(iconSvg).toString("base64")
        );

    tray = new Tray(icon);

    tray.setToolTip("Pixel Pet");

    updateTrayMenu();

    tray.on(
        "double-click",
        () => {
            if (
                petWindow &&
                !petWindow.isDestroyed()
            ) {
                petWindow.show();
                petWindow.focus();
            }
        }
    );
}

function updateTrayMenu() {
    if (!tray) {
        return;
    }

    const template = [
        {
            label: "Show Pet",

            click: () => {
                if (
                    petWindow &&
                    !petWindow.isDestroyed()
                ) {
                    petWindow.show();
                }
            }
        },

        {
            label: "Hide Pet",

            click: () => {
                if (
                    petWindow &&
                    !petWindow.isDestroyed()
                ) {
                    petWindow.hide();
                }
            }
        },

        {
            type: "separator"
        },

        {
            label:
                petPaused
                    ? "Resume"
                    : "Pause",

            click: () => {
                if (petPaused) {
                    clearTimedPause();
                    setPaused(false);
                } else {
                    setPaused(true);
                }
            }
        },

        {
            label: "Pause 10 minutes",

            click: () => {
                startTimedPause(10);
            }
        },

        {
            label: "Pause 30 minutes",

            click: () => {
                startTimedPause(30);
            }
        },

        {
            type: "separator"
        },

        {
            label: "Quit Pixel Pet",

            click: () => {
                app.quit();
            }
        }
    ];

    tray.setContextMenu(
        Menu.buildFromTemplate(template)
    );
}


/* GLOBAL SHORTCUTS */

function registerShortcuts() {
    globalShortcut.register(
        "Control+Shift+Q",
        () => {
            console.log(
                "QUIT SHORTCUT PRESSED"
            );

            app.quit();
        }
    );

    globalShortcut.register(
        "Control+Shift+P",
        () => {
            if (petPaused) {
                clearTimedPause();
                setPaused(false);
            } else {
                setPaused(true);
            }
        }
    );

    globalShortcut.register(
        "Control+Shift+H",
        () => {
            if (
                !petWindow ||
                petWindow.isDestroyed()
            ) {
                return;
            }

            if (petWindow.isVisible()) {
                petWindow.hide();
                console.log("PET HIDDEN");
            } else {
                petWindow.show();
                console.log("PET SHOWN");
            }
        }
    );
}


/* APP START */

app.whenReady().then(() => {
    createPetWindow();
    createTray();
    registerShortcuts();

    app.on(
        "activate",
        () => {
            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {
                createPetWindow();
            }
        }
    );
});


/* CLEANUP */

app.on(
    "will-quit",
    () => {
        clearTimedPause();

        globalShortcut.unregisterAll();

        if (tray) {
            tray.destroy();
            tray = null;
        }
    }
);


/*
 * Keep the app alive when the frameless
 * pet window is hidden.
 */
app.on(
    "window-all-closed",
    (event) => {
        event.preventDefault();
    }
);
