module.exports =

    class Risposta {
        constructor(req, data, err) {
            this.data = data
            this.err = err
            this.time = new Date //per esempio, giusto per avere qualche dato da far ritornare
            console.log("sono qui")

        }
    }
