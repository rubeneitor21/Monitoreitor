import * as os from 'os'
import * as child from 'child_process'
import fetch from 'node-fetch'

console.clear()

/* -------------------------------------------------------------------------- */
/*                                  Get Data                                  */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Get RAM -------------------------------- */

async function getRamPercent() {
    let totalmem = os.totalmem()
    let freemem = os.freemem()

    return (Math.round((totalmem - freemem) / totalmem * 10000) / 100)
}

/* --------------------------------- Get CPU -------------------------------- */

async function getCpuUsage(){
    if (os.platform == 'win32') {
        let data = await child.execSync('powershell.exe -Command "Get-Counter -Counter \\"\\Procesador(_total)\\% de tiempo de procesador\\" -SampleInterval 5"')
        
        return parseFloat(data.toString().match(/([0-9]+\,[0-9]+)/g)[0].replace(",", ".")).toFixed(2)
    }
    else {
        let data = os.loadavg()
        // console.log(data)
        return parseFloat(data[0].toFixed(2))
    }
    
}

/* --------------------------------- Get IP --------------------------------- */

async function getIp() {
    let interfaces = os.networkInterfaces()["Ethernet"] || os.networkInterfaces()["eth0"]
    let ip
    interfaces.forEach(element => {
        if (element.family == "IPv4"){
            ip = element.address
        }
    });

    return ip
}

/* --------------------------------- Get MAC -------------------------------- */

async function getMac() {
    if (os.networkInterfaces()["Ethernet"]) {
        return os.networkInterfaces()["Ethernet"][0].mac
    }
    else {
        return os.networkInterfaces()["eth0"][0].mac
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Send Data                                 */
/* -------------------------------------------------------------------------- */

async function upload() {
    try{
        if (os.platform == 'win32'){
            await fetch( 'http://192.168.1.23:7777', {
                method: "POST",
                body: JSON.stringify({
                    cpu: await getCpuUsage(),
                    ram: await getRamPercent(),
                    os: os.platform(),
                    deviceName: os.hostname(),
                    ip: await getIp(),
                    mac: await getMac(),
                    date: Date.now()
                }),
                headers: {
                    "Content-type": "application/json"
                }
            })
        }
        else {
            import('node-fetch').then(fetch( 'http://192.168.1.23:7777', {
                method: "POST",
                body: JSON.stringify({
                    cpu: await getCpuUsage(),
                    ram: await getRamPercent(),
                    os: os.platform(),
                    deviceName: os.hostname(),
                    ip: await getIp(),
                    mac: await getMac(),
                    date: Date.now()
                }),
                headers: {
                    "Content-type": "application/json"
                }
            }))
        }
    }
    catch (e) {console.error("Failed to send", e)}
    setTimeout(upload, 5000)
}

upload()