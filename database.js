const database = {}
module.exports = database

const sqlite3 = require("sqlite3")

let db = new sqlite3.Database('database.db')

// init
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS apps (id TEXT, name TEXT, description TEXT, source TEXT, owner TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS names (id TEXT, name TEXT)")
    // db.run("CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY, name TEXT, description TEXT, source TEXT, owner TEXT)")
})

// generate id
const id_chars = "0123456789abcdef".split("")
function generateId() {
    let str = ""
    for (i = 0; i < id_chars.length; i++) {
        str += id_chars[Math.floor(Math.min(Math.random() * id_chars.length, id_chars.length - 1))]
    }
    return str
}

// add
database.add = (name, owner) => {
    db.serialize(function () {
        db.run("INSERT INTO apps (name, source, description, owner, id) VALUES (?, ?, ?, ?, ?)", name, "", "", owner, generateId())
    })
}

// list
database.list = async () => {
    const list = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all("SELECT id, name, owner, description FROM apps", (err, rows) => {
                if (err) return reject(err)
                resolve(rows)
            })
        })
    })

    return list
}

// get
database.get = async (id) => {
    const data = await new Promise((resolve, reject) => {
        db.get(
            'SELECT source, owner, description FROM apps WHERE id = ?',
            id,
            (err, rows) => {
                if (rows && err == null) {
                    resolve(rows)
                } else {
                    resolve(null)
                }
            }
        )
    })

    return data
}

// set
database.set = async (id, name, description, source) => {
    return await new Promise((resolve, reject) => {
        db.run("UPDATE apps SET name = ?, description = ?, source = ? WHERE id = ?", [name, description, source, id], function (err) {
            if (err) {
                resolve(false)
            }
            resolve(true)
        })
    })
}

// remove
database.remove = async (id) => {
    return await new Promise((resolve, reject) => {
        db.run("DELETE FROM apps WHERE id = ?", [id], function(err) {
            if (err) {
                resolve(false)
            }
            resolve(true)
        })
    })
}

// get name
database.getName = async (id) => {
    return await new Promise((resolve, reject) => {
        db.get(
            'SELECT name FROM names WHERE id = ?',
            id,
            (err, rows) => {
                if (rows && err == null) {
                    resolve(rows.name)
                } else {
                    resolve(null)
                }
            }
        )
    })
}

// set name
database.setName = async (id, name) => {
    await new Promise(async (resolve, reject) => {
        if (database.getName(id) != null) {
            // name already exist, replace
            db.run("UPDATE names SET name = ? WHERE id = ?", [name, id], () => {resolve()})
        } else {
            // name doesnt exist, add
            db.run("INSERT INTO names (id, name) VALUES (?, ?)", [id, name], () => {resolve()})
        }
    })
}