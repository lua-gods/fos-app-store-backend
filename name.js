const fetch = require('node-fetch') // fetch

const name = {}
module.exports = name

const db = require("./database")

name.set = async (id, name) => {
    await db.setName(id, name)
}

name.get = async (id, token) => {
    let username = await db.getName(id)

    if ((username == null || /^\s*$/.test(username)) && token) {
        const res = await fetch("https://discord.com/api/oauth2/@me", {
            method: "GET",
            headers: {
                authorization: token
            }
        })
        
        if (res.status == 200) {
            const data = await res.json()

            if (data.application.id == process.env.clientId) {
                if (data.user.global_name) {
                    username = data.user.global_name
                } else {
                    username = data.user.username
                }
                db.setName(id, username)
            }
        }
    }

    return username
}