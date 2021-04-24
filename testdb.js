// copia del servizio per provarlo localmente


const fs = require("fs")
const path = require("path")
const { database } = require('liburno_lib')



//otteniamo prima di tutto il database 
var dbUtenti = () => {
    var file = path.join(__dirname, "./data/utenti.db")
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

var db = dbUtenti()
var data=getUtenti(db);
db.chiudi() //per chiudere il database una volta aperto 
console.log(data);
fs.writeFileSync("out.json",JSON.stringify(data,null,2));


