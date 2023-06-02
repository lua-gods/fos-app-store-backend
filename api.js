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

    if (name.length > 100 || name.match("\n")) {
        res.status(400)
        return res.send("400 invalid name (> 100 || .match('\n'))")
    }

    db.add(name, "", id)
    res.send("success")
}

get_api["/getApp"] = async (req, res) => {
    const id = parseInt(req.query.id);

    if (isNaN(id)) {
        return res.send("")
    }

    const app = await db.get(id)
    if (app) {
        res.send(app.source)
    } else {
        res.send("")
    }

}

post_api["/updateApp"] = async (req, res) => {
    const user_id = await auth.getId(req.get("authorization"))
    if (user_id == null) {
        return unauthorized(res)
    }

    const name = `${req.body.name}`
    const code = `${req.body.code}`
    const id = parseInt(req.body.id)

    if (name.length > 100 || name.match("\n")) {
        res.status(400)
        return res.send("400 invalid name (> 100 || .match('\n'))")
    }
    
    if (isNaN(id)) {
        res.status(400)
        return res.send("400 invalid id")
    }

    const data = await db.get(id)

    if (data == null) {
        res.status(400)
        return res.send("400 invalid id")
    }

    if (data.owner != user_id) {
        return unauthorized(res)
    }

    if (db.set(id, name, code)) {
        res.status(200)
        res.send("success")
    } else {
        res.status(400)
        res.send("unknown error")
    }
}

post_api["/deleteApp"] = async (req, res) => {
    const user_id = await auth.getId(req.get("authorization"))
    if (user_id == null) {
        return unauthorized(res)
    }

    const id = parseInt(req.body.id)
    
    if (isNaN(id)) {
        res.status(400)
        return res.send("400 invalid id")
    }

    const data = await db.get(id)

    if (data == null) {
        res.status(400)
        return res.send("400 invalid id")
    }

    if (data.owner != user_id) {
        return unauthorized(res)
    }

    if (db.remove(id)) {
        res.send("success")
    } else {
        res.status(400)
        res.send("unknown error")
    }
}