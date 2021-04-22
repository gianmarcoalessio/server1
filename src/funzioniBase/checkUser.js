// MD5: Message Digest 5, questa funzione prende in input una stringa di lunghezza arbitraria e ne produce in output un'altra a 128 bit. 
//TEST DI CRITTOGRAFAZIONE IL NOME DELL'USER per nascondere gli utenti

const crypto = require("crypto") //è come file system parte integrante di node, non serve importarlo 

const salt = "hfqrifhouwahfbvshveor" // per crittografare la crittografazione, in modo tale che per cercare nome in un database l'hacker deve conoscere anche il termine salt

//utenti registrati (database degli utenti), viene fatta su un database sqlite 
var utenti = [
    {
        user: "Giammi",
        level: 1
    },
    {
        user: "Jacopo",
        level: 2
    },
    {
        user: "Tuchick",
        level: 9
    }
]

module.exports = function checkUser(req, livello) {
    
    var { _UID } = req.body //_UID : è l'user ID, oggetto della struttura
    if (!_UID) {
        throw new Error("utente non abilitato")
    }
    if (_UID=="guest"){
        if (livello>0){
            throw new Error(`utente guest non autorizzato al livello ${livello}`)
        }
        return {user: "guest",level: 0}
    }
    for (var u of utenti){
        //var tm = crypto.createHash("md5").update(salt + u.user + salt || "").digest("hex") //da usare in produzione
        tm =u.user //in debug è meglio usare l'utente in chiaro, cioè non crittografato
        if (tm==_UID){
            if (livello>u.level){
                throw new Error(`utente ${u.user} non autorizzato al livello ${livello}`)
            }
            return u
        }
    }
    throw new Error("Utente non presente nel database")
}