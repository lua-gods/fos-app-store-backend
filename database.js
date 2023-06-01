const database = {}
module.exports = database

const sqlite3 = require("sqlite3")

// init
const db = new sqlite3.Database('database.db')

db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY, name TEXT, source TEXT, owner TEXT)")
})

db.close()

// add
database.add = (name, source, owner) => {
    const db = new sqlite3.Database('database.db')

    db.serialize(function () {
        db.run("INSERT INTO apps (name, source, owner) VALUES (?, ?, ?)", name, source, owner)
    })

    db.close()
}

// list
database.list = async () => {
    const db = new sqlite3.Database('database.db')

    const list = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all("SELECT id, name, owner FROM apps", (err, rows) => {
                if (err) return reject(err)
                resolve(rows)
            })
        })
    });

    db.close()

    return list
}

// database.add("foxgirls <3", "no source code found", "")