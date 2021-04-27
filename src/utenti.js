const router = require('express').Router();
const moduleAlias = require("module-alias")
const fs = require("fs")
const path = require("path")
const Risposta = require('@base/risposta.js')
const checkUser = require('@base/checkUser.js')
const { database } = require('liburno_lib')
module.exports = router;

//otteniamo prima di tutto il database 
var dbUtenti = () => {
    var file = path.join(__dirname, "../data/utenti.db")
    var fl=fs.existsSync(file);    // controlla se esiste il file 
    var db = database.db(file)     // crea o apre il file 
    if (!fl) {                     // il file non esisteva ... quindi creo le tabella per la prima volta
        db.prepare(`     
        CREATE TABLE if not exists utenti (
            nome NVARCHAR COLLATE NOCASE DEFAULT '',
            pass NVARCHAR COLLATE NOCASE DEFAULT '',
            level INTEGER DEFAULT 0,
            email NVARCHAR COLLATE NOCASE DEFAULT '',
            PRIMARY KEY (nome)
         );
    
`).run();
    }
    return db
}

var getUtenti=(db)=>{
    var sql="select nome,pass,level,email from utenti order by nome"
    return db.prepare(sql).all()
}


router
    .post('/', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var db = dbUtenti()
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, "ok"))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/list', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var db = dbUtenti()
            var data=getUtenti(db);
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, data))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/add', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var { nome,pass,level,email} = req.body
            var db = dbUtenti()
            var sql="insert or replace into utenti (nome, pass, level, email) values (?,?,?,?) ";
            //db.begin();   
            db.prepare(sql).run(nome,pass,level,email);
            //db.commit();
            var data=getUtenti(db);
            
            // db.run(sql,nome,pass,level,email);
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, data))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/delete', (req, res) => {
        try {
            var u = checkUser(req, 0)
            var { nome} = req.body
           
            var db = dbUtenti()
            var sql="delete from utenti where nome = ?";
            db.prepare(sql).run(nome);
            var dati=getUtenti(db);
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    .post('/setlevel', (req, res) => {
        try {
            var u = checkUser(req, 9)
            var {nome,livello}=req.body;
            var db = dbUtenti()
            var sql="update utenti set level=? where nome = ?"
            db.prepare(sql).run(livello,nome);
            var dati=getUtenti(db);
           
            db.chiudi() //per chiudere il database una volta aperto 
            res.send(new Risposta(req, dati))
        } catch (e) {
            res.send(new Risposta(req, null, e.message))
        }
    })
    