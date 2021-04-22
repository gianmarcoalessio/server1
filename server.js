const express = require('express')
const fs = require("fs")
const moduleAlias = require("module-alias") //alias delle cartelle, molto utile
const path = require("path")
const app = express()
moduleAlias.addAlias("@public", path.join(__dirname,"./public"))//utile perche se dobbiamo cambiare nomi di cartelle basta cambiare il percorso, ma non funziona con express.static, ma solo con i SERVIZI
moduleAlias.addAlias("@css","./public/css") //senza il path join percorso relativo altrimenti con percorso assoluto
moduleAlias.addAlias("@src","./src")
moduleAlias.addAlias("@data","./data")
/* Alternativa di moduleAlias.addAlias
moduleAlias.addAliases({
    "@src":"./src",
    "@data":"./data"
})*/
app.use(express.json()) //serve per usare i servizi in POST
//Per tutte le constati globali si farà utilizzo del client, similmente all'approccio con option; anche per una questione di sicurezza sui parametri costanti, per farlo bisogna costruire sul package.json l'opzione client
var client = require("./package.json").client || {} //mi interessa solo l'oggetto client

app.use("/", express.static("./public")) //viene preso automaticamente il file che si chiama index all'interno della cartella dato che espress.static vuole tutto il contenuto di una cartella

app.use("/othello",express.static(path.join(__dirname,"../othello/public")))

//l'ordine di running dipende dalla nomina dei file che sono presenti nelle nostre cartelle, per esempio se avessimo un file di nome 
//test.html dentro public avrebbe runnato quello al posto di test.html scritto qua sotto. Il nome dell'indirizzo è fondamentalmente
//legato al nome del file e quindi all'ordine di running. RILEGGI TUTTO LENTAMENTE.

app.get('/test.html', function (req, res) {
    res.send('Hello World')
})



app.listen(client.port || 3000,()=>{
    console.log("il server è partito sulla porta",client.port || 3000)
}) // se client.port non esiste passa di default alla porta 3000