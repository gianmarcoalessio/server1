const router = require('express').Router();
const moduleAlias = require("module-alias")
const Risposta = require('@base/risposta.js')
const checkUser = require('@base/checkUser.js')
console.log("router");
module.exports = router;

var count = 0 //variabile globale

router
    .get('/', (req, res) => {
        res.send("servizio incluso");
    })
    .post('/echo', (req, res) => {
        res.send(req.body) //questo tipo di servizio si chiama echo e ristituisce quello che noi li mandiamo 
    })
    .post('/post1', (req, res) => {
        try {
            var u = checkUser(req, 0)//il secondo paramtro è il livello di autorizzazione: 9 livello amministratore massimo
            var tm = req.body || {}
            if (u.level==1){
                res.send(new Risposta(req,{
                    dati:"dati forniti a livello 1"
                }))
            }
            tm.u=u
            tm.counter = count++
            res.send(new Risposta(req, tm)) //conta quante volte il servizio é stato chimato 
        } catch (e) {
            console.log("sono in errore",e.message)
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/post2', (req, res) => {
        try {
            var u = checkUser(req, 2)//il secondo paramtro è il livello di autorizzazione: 9 livello amministratore massimo
            var tm = req.body || {}
            tm.u=u
            tm.counter = count++
            res.send(new Risposta(req, tm)) //conta quante volte il servizio é stato chimato 
        } catch (e) {
            console.log("sono in errore",e.message)
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/post9', (req, res) => {
        try {
            var u = checkUser(req, 9)//il secondo paramtro è il livello di autorizzazione: 9 livello amministratore massimo
            var tm = req.body || {}
            tm.u=u
            tm.counter = count++
            res.send(new Risposta(req, tm)) //conta quante volte il servizio é stato chimato 
        } catch (e) {
            console.log("sono in errore",e.message)
            res.send(new Risposta(req, null, e.message))
        }
    })




