const http = require('http')
const fs = require("fs")

console.clear()

const server = http.createServer((req,res) =>{

    /* -------------------------------------------------------------------------- */
    /*                                 Handle POST                                */
    /* -------------------------------------------------------------------------- */

    if (req.method == "POST") {
        let data = []
        
        req.on('data', c => {
            data.push(c)
        })

        req.on('end', () => {
            let file = JSON.parse(fs.readFileSync('data.json'))
            data = JSON.parse(Buffer.concat(data).toString())
            
            file[data.deviceName] = data
            fs.writeFileSync('data.json', JSON.stringify(file,0,2))
        })
        
        res.writeHead(200)
        res.end()
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Handle GET                                 */
    /* -------------------------------------------------------------------------- */

    else if (req.method == "GET") {
        res.writeHead(200, {'Content-type': 'text/html'})

        /* ----------------------------- Prepare Respone ---------------------------- */

        let pcs = []
        let text = ''

        let rawData = JSON.parse(fs.readFileSync('data.json'))

        for (const pc in rawData) {
            if (Object.hasOwnProperty.call(rawData, pc)) {
                const element = rawData[pc];
                pcs.push(element)
            }
        }

        // console.log(pcs)

        for(i = 0; i < pcs.length; i++){

            if (pcs[i].date + 30000 >= Date.now()){
                text += `<div id="${pcs[i].deviceName}" class="pc">${pcs[i].deviceName}:<br>&nbsp;&nbsp;&nbsp;OS: ${pcs[i].os}<br>&nbsp;&nbsp;&nbsp;IP: ${pcs[i].ip} & MAC: ${pcs[i].mac}<br>&nbsp;&nbsp;&nbsp;CPU: ${pcs[i].cpu}%<br>&nbsp;&nbsp;&nbsp;RAM: ${pcs[i].ram}%<br>&nbsp;&nbsp;&nbsp;Hace: ${(Date.now() - pcs[i].date)/1000}s</div>`
            }
            else {
                if ((Date.now() - pcs[i].date) / 1000 <= 60) {
                    text += `<div id="${pcs[i].deviceName}" class="pc">${pcs[i].deviceName}: Ultima conexion hace ${(Date.now() - pcs[i].date) / 1000}s </div>`
                }

                else {
                    text += `<div id="${pcs[i].deviceName}" class="pc">${pcs[i].deviceName}: Ultima conexion: ${new Date(pcs[i].date).toLocaleDateString()} ${new Date(pcs[i].date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} </div>`
                }
            }

        }

        /* ----------------------------- Write Response ----------------------------- */

        res.end(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${fs.readFileSync("style.css")}</style>
                    <title>Visor</title>
            </head>
            <body>
                ${text}
                <script>window.onload = () => {setTimeout(function () {window.location.reload()}, 5000)}</script>
            </body>
        </html>
        `)
    }


}).listen(7777)

server.on('listening', () => console.log("Ready"))