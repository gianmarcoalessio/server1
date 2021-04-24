const router = require('express').Router();
const moduleAlias = require("module-alias")
const fs = require("fs")
const path = require("path")
const Risposta = require('@base/risposta.js')
const checkUser = require('@base/checkUser.js')
const { database } = require('liburno_lib')
module.exports = router;

//otteniamo prima di tutto il database 
var dbComuni = () => {
    var file = path.join(__dirname, "../data/comuni.db")
    console.log(file)
    var db = database.db(file)
    return db
}




router
    .get('/', (req, res) => {
        res.send("servizio incluso");
    })
    .post('/_proto', (req, res) => {
        try {
            var u = checkUser(req, 0)
            res.send(new Risposta(req, "okay"))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/treviso', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var db = dbComuni() //ottengo l'oggetto database e lo apro creando un puntatore che poi ho bisogno di rilasciare con la funzione db.chiudi
            var sql = "select sigla,name,regione,provincia from comuni where sigla like '026%'"
            var dati = db.prepare(sql).all()//prepara e compila la query e all ritorna tutti i dati alla variabile dati  
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    //provincia qualsiasi
    .post('/provincia', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var { prv } = req.body //prv: provincia, voglia sostituire la provincia nel '026%' all'interno del sql 
            if (!prv || prv.length != 3) {
                throw new Error("provincia non valida")
            }
            prv += "%" //perchè il like vuole il % e glielo lo attaco subito dopo

            var db = dbComuni() //ottengo l'oggetto database e lo apro creando un puntatore che poi ho bisogno di rilasciare con la funzione db.chiudi
            var sql = `select sigla,name,regione,provincia from comuni where sigla like ?`//il punto di domanda viene sostituito dai parametri della funzione all(prv) scritta sotto, se ce ne sono più di uno vengo passati in ordine 
            var dati = db.prepare(sql).all(prv)//prepara e compila la query e all ritorna tutti i dati alla variabile dati  

            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    //tutti i dati del comune specifico
    .post('/comune', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var { sigla } = req.body

            var db = dbComuni()
            var sql = `select rowid,sigla,name,regione,provincia,zona,abitanti,abmaschi,abfemmine,superficie,cap,prefissotel,istat,catasto,patrono,festa,sito,email,etimologia,ind,telefono,fax,partiva,codfisc,emailcert,latitudine,longitudine,lat,long,locator,sismica,zonaclima,zonatipo,altmedi,altminima,altmassima from comuni where sigla = ?`
            var dati = db.prepare(sql).get(sigla)//get al posto di all mi ritorna una struttura e non un vettore, ed è conveniente nel momento in cui ci aspettiamo un solo elemento al posto di un serie di elelmenti

            //ricerca degli aministratori 
            var sql = `select carica,nome,dtnascita, titolo from amm where sigla = ?`
            var amm = db.prepare(sql).all(sigla)
            dati.amm = amm //inseriamo nel nostro oggetto costruito da noi precedentemente i dati degli amministratori associati al comune

            //ricerca delle info
            var sql = `select t,des from info where sigla = ?`
            var info = db.prepare(sql).all(sigla)
            dati.info = info

            db.chiudi()
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    //rapporto di valore abitanti femmine emaschi
    .post('/rapportomaschifemmine', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var db = dbComuni()
    
            db.function("rapporto",(a,b)=> {
                return a/b;
            })

            var sql = `select name,provincia,abmaschi,abfemmine, rapporto(abfemmine,abmaschi) as rap1 from comuni order by rap1 desc limit 20`
            var dati = db.prepare(sql).all()//prepara e compila la query e all ritorna tutti i dati alla variabile dati  

            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })