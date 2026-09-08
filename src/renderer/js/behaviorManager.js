console.log("BEHAVIOR MANAGER IS RUNNING");


class BehaviorManager {

    constructor(
        animationManager,
        statsManager
    ) {

        this.animationManager =
            animationManager;

        this.statsManager =
            statsManager;

        this.stateManager =
            null;

        this.movementManager =
            null;

        this.timer =
            null;

        this.currentTimeout =
            null;

        this.isBusy =
            false;

        this.lastBehavior =
            null;

        this.currentMood =
            null;

        this.minDelay =
            6000;

        this.maxDelay =
            14000;
    }


    /* =================================
       CONNECTIONS
    ================================= */

    setStateManager(
        stateManager
    ) {

        this.stateManager =
            stateManager;
    }


    setMovementManager(
        movementManager
    ) {

        this.movementManager =
            movementManager;
    }


    /* =================================
       START
    ================================= */

    start() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }

        this.scheduleBehavior();
    }


    /* =================================
       MOOD
    ================================= */

    getMood() {

        const happiness =
            this.statsManager.getHappiness();

        const energy =
            this.statsManager.getEnergy();


        /*
         * Very unhappy
         */

        if (
            happiness < 25
        ) {

            return "SAD";
        }


        /*
         * Very low energy
         */

        if (
            energy < 20
        ) {

            return "TIRED";
        }


        /*
         * Happy + energetic
         */

        if (
            happiness >= 75 &&
            energy >= 60
        ) {

            return "PLAYFUL";
        }


        return "NORMAL";
    }


    /* =================================
       STATS CHANGED
    ================================= */

    onStatsChanged(
        stats
    ) {

        if (
            !this.stateManager ||
            this.stateManager.paused
        ) {
            return;
        }

        const newMood =
            this.getMood();


        /*
         * First time
         */

        if (
            this.currentMood === null
        ) {

            this.currentMood =
                newMood;

            console.log(
                `Pet mood: ${newMood}`
            );

            return;
        }


        /*
         * Nothing changed
         */

        if (
            this.currentMood ===
            newMood
        ) {
            return;
        }


        console.log(
            `Pet mood changed: ${this.currentMood} → ${newMood}`
        );


        this.currentMood =
            newMood;


        /*
         * Don't interrupt feeding,
         * playing, petting, etc.
         */

        if (this.isBusy) {
            return;
        }


        /*
         * Recalculate the next
         * autonomous behavior.
         */

        this.clearTimer();

        this.scheduleBehavior(
            true
        );
    }


    /* =================================
       SCHEDULE
    ================================= */

    scheduleBehavior(
        reactToMood = false
    ) {

        this.clearTimer();


        if (
            !this.stateManager ||
            this.stateManager.paused
        ) {
            return;
        }


        const mood =
            this.getMood();


        this.currentMood =
            mood;


        let minDelay =
            this.minDelay;

        let maxDelay =
            this.maxDelay;


        /*
         * Mood affects how quickly
         * the pet acts again.
         */

        switch (mood) {

            case "TIRED":

                minDelay = 10000;
                maxDelay = 18000;

                break;


            case "SAD":

                minDelay = 9000;
                maxDelay = 16000;

                break;


            case "PLAYFUL":

                minDelay = 4500;
                maxDelay = 10000;

                break;


            case "NORMAL":

            default:

                minDelay = 6000;
                maxDelay = 14000;
        }


        /*
         * If the mood just changed,
         * react sooner.
         */

        if (reactToMood) {

            minDelay =
                Math.min(
                    minDelay,
                    1500
                );

            maxDelay =
                Math.min(
                    maxDelay,
                    3000
                );
        }


        const delay =
            minDelay +
            Math.random() *
            (maxDelay - minDelay);


        this.timer =
            setTimeout(
                () => {

                    this.timer =
                        null;

                    this.chooseBehavior();

                },
                delay
            );
    }


    /* =================================
       CHOOSE BEHAVIOR
    ================================= */

    chooseBehavior() {

        if (
            this.isBusy
        ) {

            this.scheduleBehavior();

            return;
        }


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        const mood =
            this.getMood();


        /*
         * ==============================
         * TIRED
         * ==============================
         */

        if (
            mood === "TIRED"
        ) {

            const random =
                Math.random();


            if (
                random < 0.65
            ) {

                this.sleep();

            } else {

                this.sit();
            }

            return;
        }


        /*
         * ==============================
         * SAD
         * ==============================
         */

        if (
            mood === "SAD"
        ) {

            const random =
                Math.random();


            if (
                random < 0.40
            ) {

                this.sit();

            } else if (
                random < 0.70
            ) {

                this.lookAround();

            } else {

                this.stretch();
            }

            return;
        }


        /*
         * ==============================
         * PLAYFUL
         * ==============================
         */

        if (
            mood === "PLAYFUL"
        ) {

            const random =
                Math.random();


            if (
                random < 0.25
            ) {

                this.playfulJump();

            } else if (
                random < 0.50
            ) {

                this.stretch();

            } else if (
                random < 0.70
            ) {

                this.lookAround();

            } else {

                this.sit();
            }

            return;
        }


        /*
         * ==============================
         * NORMAL
         * ==============================
         */

        const random =
            Math.random();


        if (
            random < 0.25
        ) {

            this.sit();

        } else if (
            random < 0.45
        ) {

            this.stretch();

        } else if (
            random < 0.65
        ) {

            this.lookAround();

        } else if (
            random < 0.82
        ) {

            this.doNothing();

        } else {

            this.sit();
        }
    }


    /* =================================
       SIT
    ================================= */

    sit() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        this.startBehavior(
            "SITTING",
            "sit",
            2500 +
            Math.random() * 3500
        );
    }


    /* =================================
       STRETCH
    ================================= */

    stretch() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        this.startBehavior(
            "STRETCHING",
            "stretch",
            1200
        );
    }


    /* =================================
       LOOK
    ================================= */

    lookAround() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        this.startBehavior(
            "LOOKING",
            "look",
            1500 +
            Math.random() * 1200
        );
    }


    /* =================================
       SLEEP
    ================================= */

    sleep() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        this.startBehavior(
            "SLEEPING",
            "sleep",
            5000 +
            Math.random() * 5000
        );
    }


    /* =================================
       PLAYFUL JUMP
    ================================= */

    playfulJump() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        if (
            !this.animationManager
                .petAssets
                .hasAnimation("jump")
        ) {

            this.sit();

            return;
        }


        this.startBehavior(
            "JUMPING",
            "jump",
            1000
        );
    }


    /* =================================
       NOTHING
    ================================= */

    doNothing() {

        this.isBusy =
            true;


        this.lastBehavior =
            "NOTHING";


        const duration =
            1500 +
            Math.random() * 2500;


        this.currentTimeout =
            setTimeout(
                () => {

                    this.currentTimeout =
                        null;

                    this.finishBehavior();

                },
                duration
            );
    }


    /* =================================
       GENERIC BEHAVIOR
    ================================= */

    startBehavior(
        state,
        animation,
        duration
    ) {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        this.isBusy =
            true;

        this.lastBehavior =
            state;


        if (
            this.stateManager
        ) {

            this.stateManager.forceState(
                state,
                animation
            );

        } else {

            this.animationManager.play(
                animation
            );
        }


        this.currentTimeout =
            setTimeout(
                () => {

                    this.currentTimeout =
                        null;

                    this.finishBehavior();

                },
                duration
            );
    }


    /* =================================
       FINISH
    ================================= */

    finishBehavior() {

        this.isBusy =
            false;


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        if (
            this.stateManager
        ) {

            this.stateManager.forceState(
                "IDLE",
                "idle"
            );

        } else {

            this.animationManager.play(
                "idle"
            );
        }


        /*
         * Check mood again.
         *
         * This means that if the cat
         * became tired/sad while it
         * was sitting, the next behavior
         * uses the new mood.
         */

        this.currentMood =
            this.getMood();


        this.scheduleBehavior();
    }


    /* =================================
       STOP CURRENT BEHAVIOR
    ================================= */

    stopCurrentBehavior() {

        if (
            this.currentTimeout
        ) {

            clearTimeout(
                this.currentTimeout
            );

            this.currentTimeout =
                null;
        }


        this.isBusy =
            false;


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        if (
            this.stateManager
        ) {

            this.stateManager.forceState(
                "IDLE",
                "idle"
            );
        }
    }


    /* =================================
       TIMERS
    ================================= */

    clearTimer() {

        if (
            this.timer
        ) {

            clearTimeout(
                this.timer
            );

            this.timer =
                null;
        }
    }


    clearTimers() {

        this.clearTimer();


        if (
            this.currentTimeout
        ) {

            clearTimeout(
                this.currentTimeout
            );

            this.currentTimeout =
                null;
        }


        this.isBusy =
            false;
    }
}