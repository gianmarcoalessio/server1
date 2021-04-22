//utenti registrati (database degli utenti), viene fatta su un database sqlite 
var utenti = [
    {
        user: "guest",
        level:0
    },
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
    for (var u of utenti){
        if (u.user==_UID){
            if (livello>u.level){
                throw new Error(`utente ${u.user} non autorizzato al livello ${livello}`)
            }
            return u
        }
    }
    throw new Error("Utente non presente nel database")
}