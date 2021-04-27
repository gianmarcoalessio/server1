const fs = require("fs")
var { database } = require("liburno_lib")
var db1 = database.db("data/comuni.db")
var db = database.db("data/scuola.db")

var corsi = [
    { sigla: "ITA", nome: "italiano" },
    { sigla: "MAT", nome: "matematica" },
    { sigla: "YOG", nome: "yoga" },
    { sigla: "DES", nome: "jacopo" }
]
function randomint(n) {
    return Math.floor(Math.random() * n) //valore casuale da 0 a n-1
}
function randomvec(v) {
    var i= randomint(v.length)
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
    s.corsi=[...fatti]
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
    d.sigla = "d"+d.rowid

    var fatti = new Set 
    for (var i = 0; i <= randomint(2); i++) {
        var t = corsi[randomint(corsi.length)].sigla
        fatti.add(t)
    }
    d.corsi=[...fatti]
}

for (var c of corsi){
    var docente=randomvec(docenti) //al posto di scrivere docenti[randomint(docenti.length)]
    c.docente=docente.sigla

    var nstudenti = 15 +randomint(21)
    if (nstudenti>25){
        var assistente=randomvec(docenti)
        if (assistente.sigla!=c.docente){
            c.assistente=assistente.sigla
        }
    }

    //generiamo gli studenti che partecipano al corso 
    var fatti = new Set 
    for (var i = 0; i <= nstudenti; i++) {
        var t = randomvec(studenti).sigla
        fatti.add(t)
    }
    console.log(fatti)
    c.studenti=[...fatti]
}






fs.writeFileSync("out.json", JSON.stringify({studenti,docenti,corsi}, null, 2))

db.chiudi()
db1.chiudi()