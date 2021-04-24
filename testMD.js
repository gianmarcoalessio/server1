// MD5: Message Digest 5, questa funzione prende in input una stringa di lunghezza arbitraria e ne produce in output un'altra a 128 bit. 
//TEST DI CRITTOGRAFAZIONE IL NOME DELL'USER per nascondere gli utenti

//WRAPPER nel caso del cryptograffazione

const crypto = require("crypto") //è come file system parte integrante di node, non serve importarlo 
if (!String.prototype.md5){
    String.prototype.md5=()=>{
        const salt = "hfqrifhouwahfbvshveor"
        return crypto.createHash("md5").update(salt + this + salt || "").digest("hex")
    }
}

var nome = "Giammi"
console.log(nome.md5())

/* //CASO VELOCE DI TEST 
var nome = "Giammi"

const salt = "hfqrifhouwahfbvshveor" // per crittografare la crittografazione, in modo tale che per cercare nome in un database l'hacker deve conoscere anche il termine salt

console.log(crypto.createHash("md5").update(salt + nome + salt).digest("hex")) //dal terminale se runno con node testMD.js osservo come Jamison viene cambiato con 7334ddecb53aaee577c1a8f7e3098254
*/

















