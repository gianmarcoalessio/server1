const express = require('express')
const fs = require("fs")
const moduleAlias = require("module-alias") //alias delle cartelle, molto utile
const path = require("path")
const app = express()
moduleAlias.addAlias("@public", path.join(__dirname,"./public"))
moduleAlias.addAlias("@css",path.join(__dirname,"./css"))
moduleAlias.addAlias("@src", path.join(__dirname,"./src"))
moduleAlias.addAlias("@data",path.join(__dirname,"./data"))
moduleAlias.addAlias("@base",path.join(__dirname,"./src/funzioniBase"))
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

//per utilizzare i MIEI SERVI dentro src
app.use("/servo1",require("@src/servo1.js"))
app.use("/comuni",require("@src/comuni.js"))
app.use("/utenti",require("@src/utenti.js"))


app.listen(client.port || 3000,()=>{
    console.log("il server è partito sulla porta",client.port || 3000)
}) // se client.port non esiste passa di default alla porta 3000