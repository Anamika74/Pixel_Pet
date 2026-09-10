console.log(
    "BREAK MANAGER IS RUNNING"
);


class BreakManager {

    constructor(
    stateManager,
    messageManager,
    settingsManager
) {

    this.stateManager =
        stateManager;

    this.messageManager =
        messageManager;

    this.settingsManager =
        settingsManager;

    this.breakInterval =
        45 * 60;

    this.activeSeconds =
        0;

    this.timer = null;
}


    start() {

        this.stop();


        this.timer =
            setInterval(
                () => {

                    this.update();

                },
                30000
            );
    }


    async update() {

    if (
        this.stateManager.paused
    ) {
        return;
    }

    if (
        !this.settingsManager.get(
            "breakReminders"
        )
    ) {
        return;
    }

    try {

        const idleSeconds =
            await window.petAPI
                .getSystemIdleTime();

        if (
            idleSeconds < 120
        ) {

            this.activeSeconds += 30;
        }

        if (
            this.activeSeconds >=
            this.breakInterval
        ) {

            this.showReminder();

            this.activeSeconds = 0;
        }

    } catch (error) {

        console.error(
            "Break timer error:",
            error
        );
    }
}


   showReminder() {

    if (
        this.messageManager
    ) {

        this.messageManager.show(
            "You've been working for a while. Take a small break!",
            7000
        );
    }

    if (
        this.settingsManager.get(
            "notifications"
        )
    ) {

        window.petAPI.showNotification(
            "Pixel Pet",
            "You've been working for a while. Time for a short break?"
        );
    }
}


    reset() {

        this.activeSeconds =
            0;
    }


    stop() {

        if (
            this.timer
        ) {

            clearInterval(
                this.timer
            );

            this.timer =
                null;
        }
    }
}