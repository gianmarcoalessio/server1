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
            var db=dbScuola()
            db.chiudi()
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
                a.nome as assistente_nome,a.cognome as assistente_cognome,
                s.nome as studente_nome, s.cognome as studente_cognome
            from corsi as c
            left join docenti d on c.docente=d.sigla 
            left join docenti a on c.assistente=a.sigla
            left join corsoiscritti as x on x.corso=c.sigla
            left join studenti as s on x.studente=s.sigla
            order by c.sigla`
            var dati = db.prepare(sql).all()
            /*
            sql =`select 
                s.* 
            from corsoiscritti as c 
            left join studenti as s on c.studente=s.sigla 
            where c.corso=? 
            order by s.cognome,s.nome`

            var ds = db.prepare(sql)
            for(var d of dati){
                d.studenti=ds.all(d.sigla)
            }
            */
            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    /**
     * servizio ritorna tutti gli studenti associati ad un corso con studenti come oggetto in json
     * @try database
     */

    .post('/corsi3',(req,res)=>{
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
            sql =`select 
                s.* 
            from corsoiscritti as c 
            left join studenti as s on c.studente=s.sigla 
            where c.corso=? 
            order by s.cognome,s.nome`
            var ds = db.prepare(sql)
            for(var d of dati){
                d.studenti=ds.all(d.sigla)
            }
            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/studente', (req, res) => { //questo servizio ritorna i dati di uno studente e i corsi a cui partecipa 
        try {
            var u = checkUser(req, 0)
            var db=dbScuola()
            var {sigla}=req.body
            var sql ='select rowid,sigla,nome,cognome,sesso,dnascita from studenti where sigla=?'
            var dati =db.prepare(sql).get(sigla)
            sql=`select 
                x.corso,c.nome,c.costo,
                d.nome as docente_nome,d.cognome docente_cognome,
                a.nome as assistente_nome,a.cognome as assistente_cognome 
            from corsoiscritti as x 
            left join corsi as c on x.corso=c.sigla 
            left join docenti as d on d.sigla=c.docente 
            left join docenti as a on a.sigla=c.assistente  
            where x.studente=?`
            dati.corsi = db.prepare(sql).all(sigla)

            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/professore', (req, res) => { //questo servizio ritorna i dati di un professore e i corsi che ha 
        try {
            var u = checkUser(req, 0)
            var db=dbScuola()
            var {sigla}=req.body
            var sql ='select sigla,nome,cognome,sesso,titolo,stipendio,dnascita,dassunzione from docenti where sigla=?'
            var dati =db.prepare(sql).get(sigla)
            sql=`select 
                c.sigla,c.nome,
                c.docente,c.assistente
            from docenti as d 
            left join corsi as c on d.sigla= c.docente or d.sigla=c.assistente  
            where d.sigla=? `
            dati.corsi = db.prepare(sql).all(sigla)

            db.chiudi()
            res.send(new Risposta(req,dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    

    /**
     * pensare a quali altri servizi fare per una scuola:
     * (Disegnarlo, parametri inziali e finali)
     * -
     * -
     * -
     * -
     * -
     * -
     * 
     */
    

    