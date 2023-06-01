const get_api = {}
const post_api = {}
module.exports = {get: get_api, post: post_api}

// db
const db = require("./database.js")

// auth 
const auth = require('./auth.js')

function unauthorized(res) {
    res.status(401)
    res.send("401 unauthorized")
}

// apis
get_api["/id"] = async (req, res) => {
    const id = await auth.getId(req.get("authorization"))
    if (id == null) {
        return unauthorized(res)
    }

    res.send(id)
}

get_api["/list"] = async (req, res) => {
    const list = []

    for (const [key, value] of Object.entries(await db.list())) {
        list.push(`${value.id};${value.owner};${value.name.replace("\n", "\\n")}`)
    }

    res.send(list.join("\n"))
}

post_api["/newApp"] = async (req, res) => {
    const id = await auth.getId(req.get("authorization"))
    if (id == null) {
        return unauthorized(res)
    }

    const name = `${req.body.name}`

    res.setHeader('Content-Type', 'application/json')

    if (name.length > 100 || name.match("[\n]")) {
        res.status(400)
        return res.end()
    }

    db.add(name, "", id)
    res.end()
}