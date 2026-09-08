console.log("MOVEMENT MANAGER IS RUNNING");


class MovementManager {

    constructor(animationManager) {

        this.animationManager =
            animationManager;

        this.stateManager = null;
        this.behaviorManager = null;

        this.isMoving = false;

        this.timer = null;
        this.walkTimer = null;
        this.returnTimer = null;


        /*
         * ==========================================
         * WALK TIMING
         * ==========================================
         */

        this.minWait = 3500;
        this.maxWait = 9000;


        /*
         * ==========================================
         * WALKING SPEED
         * ==========================================
         *
         * Lower = slower.
         */

        this.minSpeed = 0.7;
        this.maxSpeed = 1.4;


        /*
         * ==========================================
         * OFF-SCREEN MOVEMENT
         * ==========================================
         */

        this.offScreenChance = 0.08;


        /*
         * ==========================================
         * VERTICAL MOVEMENT
         * ==========================================
         */

        this.verticalChance = 0.35;


        /*
         * ==========================================
         * WALKING DISTANCE
         * ==========================================
         */

        this.minDistance = 80;
        this.maxDistance = 280;


        /*
         * ==========================================
         * CURRENT MOVEMENT
         * ==========================================
         */

        this.directionX = 0;
        this.directionY = 0;

        this.currentSpeed = 1;
    }


    /*
     * ==========================================
     * CONNECT BEHAVIOR MANAGER
     * ==========================================
     */

    setBehaviorManager(
        behaviorManager
    ) {

        this.behaviorManager =
            behaviorManager;
    }


    /*
     * ==========================================
     * CONNECT STATE MANAGER
     * ==========================================
     */

    setStateManager(
        stateManager
    ) {

        this.stateManager =
            stateManager;
    }


    /*
     * ==========================================
     * START MOVEMENT SYSTEM
     * ==========================================
     */

    start() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }

        this.scheduleNextWalk();
    }


    /*
     * ==========================================
     * SCHEDULE NEXT WALK
     * ==========================================
     */

    scheduleNextWalk() {

        this.clearWalkTimer();

        if (this.timer) {

            clearTimeout(
                this.timer
            );

            this.timer = null;
        }


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        const delay =
            this.minWait +
            Math.random() *
            (
                this.maxWait -
                this.minWait
            );


        this.timer =
            setTimeout(
                () => {

                    this.timer = null;

                    this.chooseAction();

                },
                delay
            );
    }


    /*
     * ==========================================
     * CHOOSE MOVEMENT ACTION
     * ==========================================
     */

    chooseAction() {

        if (this.isMoving) {
            return;
        }


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * Don't interrupt sit/stretch/look/etc.
         */

        if (
            this.behaviorManager &&
            this.behaviorManager.isBusy
        ) {

            this.scheduleNextWalk();

            return;
        }


        /*
         * Small chance of leaving
         * the visible screen.
         */

        if (
            Math.random() <
            this.offScreenChance
        ) {

            this.leaveScreen();

        } else {

            this.normalWalk();
        }
    }


    /*
     * ==========================================
     * NORMAL WALK
     * ==========================================
     */

    normalWalk() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        let directionX = 0;
        let directionY = 0;


        const useVertical =
            Math.random() <
            this.verticalChance;


        if (useVertical) {

            const movementType =
                Math.random();


            /*
             * Walk upward
             */

            if (
                movementType < 0.4
            ) {

                directionY = -1;

            }


            /*
             * Walk downward
             */

            else if (
                movementType < 0.8
            ) {

                directionY = 1;

            }


            /*
             * Diagonal movement
             */

            else {

                directionX =
                    Math.random() < 0.5
                        ? -1
                        : 1;

                directionY =
                    Math.random() < 0.5
                        ? -1
                        : 1;
            }

        }


        /*
         * Horizontal movement
         */

        else {

            directionX =
                Math.random() < 0.5
                    ? -1
                    : 1;
        }


        const distance =
            this.minDistance +
            Math.random() *
            (
                this.maxDistance -
                this.minDistance
            );


        this.walk2D(
            directionX,
            directionY,
            distance
        );
    }


    /*
     * ==========================================
     * WALK IN 2D
     * ==========================================
     */

    walk2D(
        directionX,
        directionY,
        distance,
        onComplete = null
    ) {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * Prevent two walks from
         * happening simultaneously.
         */

        if (this.isMoving) {
            return;
        }


        this.isMoving = true;


        this.directionX =
            directionX;

        this.directionY =
            directionY;


        /*
         * Random walking speed.
         */

        this.currentSpeed =
            this.minSpeed +
            Math.random() *
            (
                this.maxSpeed -
                this.minSpeed
            );


        /*
         * Face the direction of travel.
         */

        if (
            directionX < 0
        ) {

            this.faceDirection(
                "left"
            );

        }

        else if (
            directionX > 0
        ) {

            this.faceDirection(
                "right"
            );
        }


        /*
         * Start walking animation.
         */

        if (this.stateManager) {

            this.stateManager.forceState(
                "WALKING",
                "walk",
                160
            );

        } else {

            this.animationManager.play(
                "walk",
                160
            );
        }


        let travelled = 0;


        this.clearWalkTimer();


        /*
         * Move every 30ms.
         */

        this.walkTimer =
            setInterval(
                () => {

                    /*
                     * Pause check.
                     */

                    if (
                        this.stateManager &&
                        this.stateManager.paused
                    ) {

                        this.stopMovement();

                        return;
                    }


                    /*
                     * Finished walking.
                     */

                    if (
                        travelled >=
                        distance
                    ) {

                        this.finishWalk(
                            onComplete
                        );

                        return;
                    }


                    const movementX =
                        directionX *
                        this.currentSpeed;


                    const movementY =
                        directionY *
                        this.currentSpeed;


                    window.petAPI.movePet(
                        movementX,
                        movementY
                    );


                    travelled +=
                        this.currentSpeed;

                },
                30
            );
    }


    /*
     * ==========================================
     * FINISH WALK
     * ==========================================
     */

    finishWalk(
        onComplete = null
    ) {

        this.clearWalkTimer();

        this.isMoving = false;


        /*
         * Special callback.
         *
         * Used by off-screen movement.
         */

        if (onComplete) {

            onComplete();

            return;
        }


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * Return to idle.
         */

        if (this.stateManager) {

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
         * Schedule another walk.
         */

        this.scheduleNextWalk();
    }


    /*
     * ==========================================
     * STOP MOVEMENT
     * ==========================================
     */

    stopMovement() {

        this.clearWalkTimer();

        this.isMoving = false;


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        if (this.stateManager) {

            this.stateManager.forceState(
                "IDLE",
                "idle"
            );

        } else {

            this.animationManager.play(
                "idle"
            );
        }
    }


    /*
     * ==========================================
     * LEAVE SCREEN
     * ==========================================
     */

    async leaveScreen() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        if (
            this.behaviorManager &&
            this.behaviorManager.isBusy
        ) {

            this.scheduleNextWalk();

            return;
        }


        /*
         * IMPORTANT:
         *
         * Do NOT set isMoving = true here.
         *
         * walk2D() does that itself.
         */

        const position =
            await window.petAPI
                .getPetPosition();


        const workArea =
            await window.petAPI
                .getWorkArea();


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * Find center of pet.
         */

        const petCenterX =
            position.x +
            position.width / 2;


        const petCenterY =
            position.y +
            position.height / 2;


        /*
         * Calculate distance to
         * each edge.
         */

        const distances = [

            {
                side: "left",

                distance:
                    Math.abs(
                        petCenterX -
                        workArea.x
                    )
            },

            {
                side: "right",

                distance:
                    Math.abs(
                        petCenterX -
                        (
                            workArea.x +
                            workArea.width
                        )
                    )
            },

            {
                side: "top",

                distance:
                    Math.abs(
                        petCenterY -
                        workArea.y
                    )
            },

            {
                side: "bottom",

                distance:
                    Math.abs(
                        petCenterY -
                        (
                            workArea.y +
                            workArea.height
                        )
                    )
            }

        ];


        /*
         * Closest edge first.
         */

        distances.sort(
            (a, b) =>
                a.distance -
                b.distance
        );


        const edge =
            distances[0].side;


        let directionX = 0;
        let directionY = 0;


        if (
            edge === "left"
        ) {

            directionX = -1;

        }

        else if (
            edge === "right"
        ) {

            directionX = 1;

        }

        else if (
            edge === "top"
        ) {

            directionY = -1;

        }

        else {

            directionY = 1;
        }


        /*
         * Face direction when
         * moving horizontally.
         */

        if (
            directionX < 0
        ) {

            this.faceDirection(
                "left"
            );

        }

        else if (
            directionX > 0
        ) {

            this.faceDirection(
                "right"
            );
        }


        /*
         * Walk far enough to
         * completely leave screen.
         */

        const distance =
            distances[0].distance +
            Math.max(
                position.width,
                position.height
            ) +
            100;


        this.walk2D(
            directionX,
            directionY,
            distance,
            () => {

                this.petIsOffScreen();

            }
        );
    }


    /*
     * ==========================================
     * PET IS OFF SCREEN
     * ==========================================
     */

    petIsOffScreen() {

        this.isMoving = false;

        this.clearWalkTimer();


        /*
         * Stop walking animation.
         */

        this.animationManager.stop();


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * Stay away for 3–6 seconds.
         */

        const delay =
            3000 +
            Math.random() * 3000;


        this.returnTimer =
            setTimeout(
                () => {

                    this.returnTimer =
                        null;

                    this.returnToScreen();

                },
                delay
            );
    }


    /*
     * ==========================================
     * RETURN TO SCREEN
     * ==========================================
     */

    async returnToScreen() {

        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * Do NOT set isMoving = true here.
         * walk2D() handles that.
         */

        const position =
            await window.petAPI
                .getPetPosition();


        const workArea =
            await window.petAPI
                .getWorkArea();


        if (
            this.stateManager &&
            this.stateManager.paused
        ) {
            return;
        }


        const petRight =
            position.x +
            position.width;


        const petBottom =
            position.y +
            position.height;


        let directionX = 0;
        let directionY = 0;


        /*
         * Pet is outside left.
         */

        if (
            position.x <
            workArea.x
        ) {

            directionX = 1;

        }


        /*
         * Pet is outside right.
         */

        else if (
            petRight >
            workArea.x +
            workArea.width
        ) {

            directionX = -1;

        }


        /*
         * Pet is outside top.
         */

        else if (
            position.y <
            workArea.y
        ) {

            directionY = 1;

        }


        /*
         * Pet is outside bottom.
         */

        else if (
            petBottom >
            workArea.y +
            workArea.height
        ) {

            directionY = -1;

        }


        /*
         * Pet somehow ended up
         * inside the screen.
         */

        else {

            this.finishWalk();

            return;
        }


        /*
         * Face direction.
         */

        if (
            directionX < 0
        ) {

            this.faceDirection(
                "left"
            );

        }

        else if (
            directionX > 0
        ) {

            this.faceDirection(
                "right"
            );
        }


        /*
         * Calculate distance needed
         * to get fully back inside.
         */

        let distance;


        if (
            directionX === 1
        ) {

            distance =
                workArea.x -
                position.x +
                position.width +
                30;

        }

        else if (
            directionX === -1
        ) {

            distance =
                petRight -
                (
                    workArea.x +
                    workArea.width
                ) +
                position.width +
                30;

        }

        else if (
            directionY === 1
        ) {

            distance =
                workArea.y -
                position.y +
                position.height +
                30;

        }

        else {

            distance =
                petBottom -
                (
                    workArea.y +
                    workArea.height
                ) +
                position.height +
                30;
        }


        this.walk2D(
            directionX,
            directionY,
            distance,
            () => {

                this.finishWalk();

            }
        );
    }


    /*
     * ==========================================
     * FACE DIRECTION
     * ==========================================
     */

    faceDirection(
        direction
    ) {

        const container =
            document.getElementById(
                "pet-container"
            );


        if (!container) {
            return;
        }


        if (
            direction === "left"
        ) {

            container.classList.add(
                "facing-left"
            );

        }

        else {

            container.classList.remove(
                "facing-left"
            );
        }
    }


    /*
     * ==========================================
     * CLEAR WALK TIMER
     * ==========================================
     */

    clearWalkTimer() {

        if (
            this.walkTimer
        ) {

            clearInterval(
                this.walkTimer
            );

            this.walkTimer =
                null;
        }
    }


    /*
     * ==========================================
     * CLEAR ALL TIMERS
     * ==========================================
     */

    clearTimers() {

        /*
         * Normal walk timer.
         */

        if (
            this.timer
        ) {

            clearTimeout(
                this.timer
            );

            this.timer =
                null;
        }


        /*
         * Active walking interval.
         */

        this.clearWalkTimer();


        /*
         * Return-from-off-screen timer.
         */

        if (
            this.returnTimer
        ) {

            clearTimeout(
                this.returnTimer
            );

            this.returnTimer =
                null;
        }


        this.isMoving =
            false;
    }

}