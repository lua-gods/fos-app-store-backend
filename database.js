const database = {}
module.exports = database

const sqlite3 = require("sqlite3")

let db = new sqlite3.Database('database.db')

// init
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY, name TEXT, source TEXT, owner TEXT)")
})

// add
database.add = (name, source, owner) => {
    db.serialize(function () {
        db.run("INSERT INTO apps (name, source, owner) VALUES (?, ?, ?)", name, source, owner)
    })
}

// list
database.list = async () => {
    const list = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all("SELECT id, name, owner FROM apps", (err, rows) => {
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
            'SELECT source, owner FROM apps WHERE id = ?',
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
database.set = async (id, name, source) => {
    return await new Promise((resolve, reject) => {
        db.run("UPDATE apps SET name = ?, source = ? WHERE id = ?", [name, source, id], function (err) {
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