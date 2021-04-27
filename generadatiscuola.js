const fs = require("fs")
var { database } = require("liburno_lib")
var db1 = database.db("data/comuni.db")

var corsi = [
    { sigla: "ITA", nome: "italiano", datacrea: 20201013, prove: [20211013, 20221013, 20231013], costo: 2000 },
    { sigla: "MAT", nome: "matematica", datacrea: 20201009, prove: [20211009, 20231009], costo: 3689 },
    { sigla: "YOG", nome: "yoga", datacrea: 20201001, prove: [20211001, 20221001], costo: 10000 },
    { sigla: "DES", nome: "jacopo", datacrea: 20200927, prove: [20230927], costo: 35999 }
]
function randomint(n) {
    return Math.floor(Math.random() * n) //valore casuale da 0 a n-1
}
function randomvec(v) {
    var i = randomint(v.length)
    return v[i] //valore casuale da 0 a n-1
}
var sql = 'select rowid, nome, dtnascita, titolo, dtelezione from amm order by random() limit 100' //se ci sono proprietà in più non è importante, perchè poi gli selezioneremo
var studenti = db1.prepare(sql).all()
for (var s of studenti) {
    var n = s.nome.split(' ')
    s.nome = n[0]
    s.cognome = n[1]
    s.sigla = "s" + s.rowid

    var fatti = new Set //per Set ignora la richiesta di aggiunta nel momento in cui viene richiesto l'aggiunta di un doppione all'interno dell'insieme 
    for (var i = 0; i <= randomint(3); i++) {
        var t = corsi[randomint(corsi.length)].sigla
        fatti.add(t)
    }
    s.corsi = [...fatti]
    /* Nello stesso modo di set si può fare con più righe di codice il seguente algoritmo 
    var fatti= {}
    for (var i=0;i<=randomint(3);i++){
        var t =corsi[randomint(corsi.length)].sigla
        //l'if mi permette di non aggiungere doppioni 
        if(!fatti[t]){
        s.corsi.push(t)
        fatti[t]=true
        }
    }
    */
}

var sql = 'select rowid, nome, dtnascita, titolo, dtelezione from amm order by random() limit 10'
var docenti = db1.prepare(sql).all()
for (var d of docenti) {
    var n = d.nome.split(' ')
    d.nome = n[0]
    d.cognome = n[1]
    d.sigla = "d" + d.rowid

    var fatti = new Set
    for (var i = 0; i <= randomint(2); i++) {
        var t = corsi[randomint(corsi.length)].sigla
        fatti.add(t)
    }
    d.corsi = [...fatti]
}

for (var c of corsi) {
    var docente = randomvec(docenti) //al posto di scrivere docenti[randomint(docenti.length)]
    c.docente = docente.sigla

    var nstudenti = 15 + randomint(21)
    if (nstudenti > 25) {
        var assistente = randomvec(docenti)
        if (assistente.sigla != c.docente) {
            c.assistente = assistente.sigla
        }
    }

    //generiamo gli studenti che partecipano al corso 
    var fatti = new Set
    for (var i = 0; i <= nstudenti; i++) {
        var t = randomvec(studenti).sigla
        fatti.add(t)
    }
    c.studenti = [...fatti]
}

//Se non cacello il file non lo rigenera (per mantenere i dati casuali generati apparte quelli costruiti alla fine dentro i 3 cicli for)
if (fs.existsSync("out.json")){
    var {studenti,docenti,corsi} = JSON.parse(fs.readFileSync("out.json"))
}else {
    fs.writeFileSync("out.json", JSON.stringify({ studenti, docenti, corsi }, null, 2))

}


db1.chiudi()


/*---------------------
È BUONA NORMA per la sicurezza della struttura del database salvarsi il risultato del commando schema nel codice perchè può 
crashare e perdersi a caso.
*/


var file = "data/scuola.db"
var esiste = fs.existsSync(file) //questo mi dice se il database c'è oppure no, perchè quando faccio l'appartura del database con il commando sotto lo crea se non esiste

var db = database.db(file)
//con questo file crea un file che non è più vuoto ma anzi ha la struttura che abbiamo costruito nella teoria prima di affrontare la creazione del database
if (!esiste) {
    db.prepare(`
    -- creazione
CREATE TABLE if not exists corsi (
   sigla NVARCHAR COLLATE NOCASE DEFAULT '',
   nome NVARCHAR COLLATE NOCASE DEFAULT '',
   docente NVARCHAR COLLATE NOCASE DEFAULT '',
   assistente NVARCHAR COLLATE NOCASE DEFAULT '',
   datacrea INTEGER DEFAULT 0,
   costo REAL DEFAULT 0,
   PRIMARY KEY (SIGLA)
);
CREATE TABLE if not exists corsoiscritti (
   corso NVARCHAR COLLATE NOCASE DEFAULT '',
   studente NVARCHAR COLLATE NOCASE DEFAULT ''
);
CREATE TABLE if not exists corsoprove (
   corso NVARCHAR COLLATE NOCASE DEFAULT '',
   data INTEGER DEFAULT 0,
   studente NVARCHAR COLLATE NOCASE DEFAULT '',
   voto INTEGER DEFAULT 0,
   giudizio NVARCHAR COLLATE NOCASE DEFAULT ''
);
CREATE TABLE if not exists docenti (
   sigla NVARCHAR COLLATE NOCASE DEFAULT '',
   nome NVARCHAR COLLATE NOCASE DEFAULT '',
   cognome NVARCHAR COLLATE NOCASE DEFAULT '',
   sesso NVARCHAR COLLATE NOCASE DEFAULT '',
   titolo NVARCHAR COLLATE NOCASE DEFAULT '',
   stipendio REAL DEFAULT 0,
   dnascita INTEGER DEFAULT 0,
   dassunzione INTEGER DEFAULT 0,
   PRIMARY KEY (SIGLA)
);
CREATE TABLE if not exists orari (
   corso NVARCHAR COLLATE NOCASE DEFAULT '',
   aula NVARCHAR COLLATE NOCASE DEFAULT '',
   giorno INTEGER DEFAULT 0,
   orai INTEGER DEFAULT 0,
   oraf INTEGER DEFAULT 0
);
CREATE TABLE if not exists studenti (
   sigla NVARCHAR COLLATE NOCASE DEFAULT '',
   nome NVARCHAR COLLATE NOCASE DEFAULT '',
   cognome NVARCHAR COLLATE NOCASE DEFAULT '',
   sesso NVARCHAR COLLATE NOCASE DEFAULT '',
   dnascita NVARCHAR COLLATE NOCASE DEFAULT '',
   PRIMARY KEY (SIGLA)
); 
`).run()
}

db.begin()//rende atomico (cioè come se fosse un unico commando) tutto quello che sta dentro db.begin() e db.commit(), è utile farlo nel caso avessimo più di una tabella da insert(in questi caso ne abbiamo tre: corsi,studenti e docenti)

//con il commando "i corsi" su tlite ottengo il commando per inserire i dati json dentro la tabella corsi:

var ds = db.prepare("insert or replace into corsi (sigla, nome, docente, assistente, datacrea, costo) values (?,?,?,?,?,?)")
for (var c of corsi) {
    ds.run(c.sigla, c.nome, c.docente, c.assistente, c.datacrea, c.costo)
}
var ds = db.prepare("insert or replace into studenti (sigla, nome, cognome, sesso, dnascita) values (?,?,?,?,?) ")
for (var s of studenti) {
    ds.run(s.sigla, s.nome, s.cognome, "x", s.dtnascita)
}
//un altro modo molto meno efficiente è quello scritto sotto
var sql = "insert or replace into docenti (sigla, nome, cognome, sesso, titolo, stipendio, dnascita, dassunzione) values (?,?,?,?,?,?,?,?)"
for (var d of docenti) {
    db.prepare(sql).run(d.sigla, d.nome, d.cognome, "x", d.titolo, 0, d.dtnascita, d.dtelezione)
}
//riprendiamo lo stesso efficace di prima
db.prepare("delete from corsoiscritti").run() //commando per cancellare tutti i record di una tabella
var ds = db.prepare("insert or replace into corsoiscritti (corso, studente) values (?,?)") //mancando la chiave primaria non sa come usare replace e quindi si è aggiunto un DELETE nella riga sopra
for (var c of corsi) {
    for (var s of c.studenti) {
        ds.run(c.sigla, s)
    }
}
db.prepare("delete from corsoprove").run() //commando per cancellare tutti i record di una tabella
var ds = db.prepare("insert or replace into corsoprove (corso, data, studente, voto, giudizio) values (?,?,?,?,?)")
for (var c of corsi) {
    for (var p of c.prove) {
        for (var s of c.studenti) {
            if (Math.random() > 0.05) {
                var voto = 5+randomint(6)
                ds.run(c.sigla,p,s,voto,voto>5?"POSITIVO":"NEGATIVO")
            }
        }
    }
}

db.commit()
db.chiudi()