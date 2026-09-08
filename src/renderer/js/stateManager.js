console.log("STATE MANAGER IS RUNNING");


class StateManager {

    constructor(animationManager) {

        this.animationManager =
            animationManager;

        this.state =
            "IDLE";

        this.previousState =
            null;

        this.paused =
            false;

        this.busy =
            false;
    }


    /*
     * ==========================================
     * SET STATE
     * ==========================================
     */

    setState(
        newState,
        animation = null,
        speed = 150
    ) {

        /*
         * Don't change anything while paused.
         */

        if (this.paused) {
            return;
        }


        /*
         * Already in this state.
         */

        if (
            this.state === newState
        ) {

            /*
             * If an animation was explicitly
             * requested, allow it to play.
             */

            if (animation) {

                this.animationManager.play(
                    animation,
                    speed
                );
            }

            return;
        }


        this.previousState =
            this.state;

        this.state =
            newState;


        console.log(
            `Pet state: ${this.previousState} → ${newState}`
        );


        if (animation) {

            this.animationManager.play(
                animation,
                speed
            );
        }
    }


    /*
     * ==========================================
     * FORCE STATE
     * ==========================================
     */

    forceState(
        newState,
        animation = null,
        speed = 150
    ) {

        if (this.paused) {
            return;
        }


        const stateChanged =
            this.state !== newState;


        if (stateChanged) {

            this.previousState =
                this.state;

            this.state =
                newState;


            console.log(
                `Pet state: ${this.previousState} → ${newState}`
            );
        }


        /*
         * Even if the state is the same,
         * explicitly requested animation
         * should restart.
         */

        if (animation) {

            this.animationManager.play(
                animation,
                speed
            );
        }
    }


    /*
     * ==========================================
     * CHECK STATE
     * ==========================================
     */

    is(state) {

        return (
            this.state === state
        );
    }


    /*
     * ==========================================
     * PAUSE
     * ==========================================
     */

    pause() {

        if (this.paused) {
            return;
        }


        this.paused =
            true;


        this.animationManager.stop();


        console.log(
            "Pet state machine paused"
        );
    }


    /*
     * ==========================================
     * RESUME
     * ==========================================
     */

    resume() {

        if (!this.paused) {
            return;
        }


        this.paused =
            false;


        /*
         * Remember the previous state.
         */

        this.previousState =
            this.state;


        /*
         * Start fresh from IDLE.
         */

        this.state =
            "IDLE";


        /*
         * IMPORTANT:
         *
         * Do NOT call forceState() here.
         *
         * forceState() can see IDLE → IDLE
         * and won't represent a real transition.
         *
         * We explicitly restart the animation.
         */

        this.animationManager.play(
            "idle"
        );


        console.log(
            `Pet state: ${this.previousState} → IDLE`
        );

        console.log(
            "Pet state machine resumed"
        );
    }

}