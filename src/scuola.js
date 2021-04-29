const router = require('express').Router();
const moduleAlias = require("module-alias")
const fs = require("fs")
const path = require("path")
const Risposta = require('@base/risposta.js')
const checkUser = require('@base/checkUser.js')
const { database } = require('liburno_lib')
module.exports = router;

//otteniamo prima di tutto il database 
var dbScuola = () => {
    var file = path.join(__dirname, "../data/scuola.db")
    var db = database.db(file)

    return db
}

router
    .post('/', (req, res) => {
        try {
            var u = checkUser(req, 0)
            res.send(new Risposta(req, "okay"))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/corsi1',(req,res)=>{
        try {
            var u = checkUser(req, 0)
            var db = dbScuola()
            var sql = "select sigla,nome,docente,assistente,datacrea,costo from corsi order by sigla"
            var dati = db.prepare(sql).all()
            var ds = db.prepare("select sigla,nome,cognome,sesso,titolo,stipendio,dnascita,dassunzione from docenti where sigla=?")
            for (var d of dati){
                d.docente= ds.get(d.docente) //run(per eseguire un comando della query), all(per ottenere tutti i dati),get(per ottenere un singolo record)
                d.assistente= ds.get(d.assistente)
            }
            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/corsi2',(req,res)=>{
        try {
            var u = checkUser(req, 0)
            var db = dbScuola()
            var sql = `select
                c.sigla,c.nome,c.docente,
                d.nome as docente_nome,d.cognome as docente_cognome,
                a.nome as assistente_nome,a.cognome as assistente_cognome 
            from corsi as c
            left join docenti d on c.docente=d.sigla 
            left join docenti a on c.assistente=a.sigla
            order by c.sigla`
            var dati = db.prepare(sql).all()
            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })

    