console.log(
    "MESSAGE MANAGER IS RUNNING"
);


class MessageManager {

    constructor() {

        this.bubble =
            document.getElementById(
                "speech-bubble"
            );

        this.hideTimer =
            null;

        this.randomTimer =
            null;


        this.messages = [

            "Hey! How's your day going?",

            "Don't forget to stretch.",

            "I'm keeping you company.",

            "Want to play?",

            "You've been working hard.",

            "Remember to take a break.",

            "I'm still here.",

            "Everything okay?",

            "Let's keep going.",

            "You got this."
        ];
    }


    show(
        message,
        duration = 4000
    ) {

        if (
            !this.bubble
        ) {
            return;
        }


        if (
            this.hideTimer
        ) {

            clearTimeout(
                this.hideTimer
            );
        }


        this.bubble.textContent =
            message;


        this.bubble.classList.add(
            "visible"
        );


        this.hideTimer =
            setTimeout(
                () => {

                    this.hide();

                },
                duration
            );
    }


    hide() {

        if (
            !this.bubble
        ) {
            return;
        }


        this.bubble.classList.remove(
            "visible"
        );
    }


    randomMessage() {

        const message =
            this.messages[
                Math.floor(
                    Math.random() *
                    this.messages.length
                )
            ];


        this.show(
            message
        );
    }


    startRandomMessages() {

        this.stopRandomMessages();


        const schedule =
            () => {

                const delay =
                    90000 +
                    Math.random() *
                    180000;


                this.randomTimer =
                    setTimeout(
                        () => {

                            this.randomMessage();

                            schedule();

                        },
                        delay
                    );
            };


        schedule();
    }


    stopRandomMessages() {

        if (
            this.randomTimer
        ) {

            clearTimeout(
                this.randomTimer
            );

            this.randomTimer =
                null;
        }
    }
}