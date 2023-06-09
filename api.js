const get_api = {}
const post_api = {}
module.exports = {get: get_api, post: post_api}

// db
const db = require("./database.js")

// auth 
const auth = require('./auth.js')

// name
const name = require('./name.js')

function unauthorized(res) {
    res.status(401)
    res.send("401 unauthorized")
}

// apis
get_api["/id"] = async (req, res) => {
    const id = await auth.getId(req.get("authorization"))
    if (id == null || id == false) {
        return unauthorized(res)
    }

    res.setHeader("Content-Type", "text/plain")
    res.send(id)
}

get_api["/list"] = async (req, res) => {
    const list = []

    for (const [key, value] of Object.entries(await db.list())) {
        const name = value.name.replace("\n", "\\n")
        list.push(`${value.id};${value.owner};${name}`)
    }
  
    res.setHeader("Content-Type", "text/plain")
    res.send(list.join("\n"))
}

post_api["/newApp"] = async (req, res) => {
    const id = await auth.getId(req.get("authorization"))
    if (id == null || id == false) {
        return unauthorized(res)
    }

    const name = `${req.body.name}`

    if (name.length > 64 || /\n/.test(name)) {
        res.status(400)
        return res.send("400 invalid name (> 100 || /\n/.test)")
    }

    db.add(name, id)
    res.setHeader("Content-Type", "text/plain")
    res.send("success")
}

get_api["/getApp"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const id = `${req.query.id}`

    const app = await db.get(id)
    if (app) {
        res.send(app.source)
    } else {
        res.send("")
    }
}

get_api["/getDescription"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const id = `${req.query.id}`

    const app = await db.get(id)
    if (app) {
        res.send(app.description)
    } else {
        res.send("")
    }
}

post_api["/updateApp"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const user_id = await auth.getId(req.get("authorization"))
    if (user_id == null || user_id == false) {
        return unauthorized(res)
    }

    const name = `${req.body.name}`
    const description = `${req.body.description}`
    const code = `${req.body.code}`
    const id = `${req.body.id}`

    if (name.length > 64 || /\n/.test(name)) {
        res.status(400)
        return res.send("400 invalid name (> 64 || /\n/.test)")
    }

    if (description.length > 512) {
        res.status(400)
        return res.send("400 invalid description (> 512)")
    }

    const data = await db.get(id)

    if (data == null) {
        res.status(400)
        return res.send("400 invalid id")
    }

    if (data.owner != user_id) {
        return unauthorized(res)
    }

    if (await db.set(id, name, description, code)) {
        res.status(200)
        res.send("success")
    } else {
        res.status(400)
        res.send("unknown error")
    }
}

post_api["/deleteApp"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const user_id = await auth.getId(req.get("authorization"))
    if (user_id == null || user_id == false) {
        return unauthorized(res)
    }

    const id = `${req.body.id}`

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

get_api["/getName"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const token = req.get("authorization")

    if (token) {
        const id = await auth.getId(token)
        if (id == null || id == false) {
            res.send("")
        } else {
            res.send(await name.get(id, token))
        }
    } else {
        const id = `${req.query.id}`
        res.send(await name.get(id))
    }
}

post_api["/setName"] = async (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const token = req.get("authorization")

    const id = await auth.getId(token)
    if (id == null || id == false) {
        return unauthorized(res)
    }

    const newName = `${req.body.name}`

    if (newName.length > 128) {
        res.status(400)
        return res.send("400 invalid name (> 128)")
    }

    await name.set(id, newName)

    res.send(await name.get(id, token))
}
