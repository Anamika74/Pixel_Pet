console.log("INTERACTION MANAGER IS RUNNING");

class InteractionManager {
    constructor(
        stateManager,
        animationManager,
        movementManager,
        behaviorManager,
        statsManager
    ) {
        this.stateManager = stateManager;
        this.animationManager = animationManager;
        this.movementManager = movementManager;
        this.behaviorManager = behaviorManager;
        this.statsManager = statsManager;

        // Prevent multiple interaction timers
        this.interactionTimer = null;
    }

    pet() {

    if (this.stateManager.paused) return;

    console.log(
        "Player pet the cat"
    );

    this.statsManager
        .changeHappiness(3);

    this.interaction(
        "HAPPY",
        "happy",
        1800
    );
}

    feed() {

    if (this.stateManager.paused) return;

    console.log(
        "Player fed the cat"
    );

    this.statsManager
        .changeHappiness(5);

    this.statsManager
        .changeEnergy(3);

    this.interaction(
        "EATING",
        "eat",
        2500
    );
}
    jump() {
        if (this.stateManager.paused) return;

        console.log("Cat jumped");

        this.interaction(
            "JUMPING",
            "jump",
            1000
            );
    }
    play() {

    if (this.stateManager.paused) return;

    console.log(
        "Player played with the cat"
    );

    this.statsManager
        .changeHappiness(10);

    this.statsManager
        .changeEnergy(-8);

    this.interaction(
        "PLAYING",
        "play",
        3000
    );
}

    interaction(
        state,
        animation,
        duration
    ) {
        // Cancel previous interaction
        this.clearInteractionTimer();

        // Stop autonomous systems
        this.movementManager.stopMovement();
        this.behaviorManager.stopCurrentBehavior();

        // Start interaction
        this.stateManager.forceState(
            state,
            animation
        );

        console.log(
            `Interaction started: ${state}`
        );

        // Return to normal after interaction
        this.interactionTimer =
            setTimeout(() => {

                this.interactionTimer = null;

                // If paused, don't restart anything
                if (
                    this.stateManager.paused
                ) {
                    return;
                }

                console.log(
                    `Interaction finished: ${state}`
                );

                // Back to idle
                this.stateManager.forceState(
                    "IDLE",
                    "idle"
                );

                // Restart autonomous systems
                this.movementManager
                    .scheduleNextWalk();

                this.behaviorManager
                    .scheduleBehavior();

            }, duration);
    }

    clearInteractionTimer() {
        if (this.interactionTimer) {
            clearTimeout(
                this.interactionTimer
            );

            this.interactionTimer = null;
        }
    }

    stopInteraction() {
        this.clearInteractionTimer();

        if (
            this.stateManager.paused
        ) {
            return;
        }

        this.stateManager.forceState(
            "IDLE",
            "idle"
        );

        this.movementManager
            .scheduleNextWalk();

        this.behaviorManager
            .scheduleBehavior();
    }

    clearTimers() {
        this.clearInteractionTimer();
    }
}