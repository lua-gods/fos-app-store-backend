// env
try {
    require('dotenv').config();
} catch { }

// server
const express = require('express')
const app = express()
app.use(express.json())

// scripts
const api = require("./api.js")
for (const [key, value] of Object.entries(api.get)) {
    app.get(`/api${key}`, value)
}

for (const [key, value] of Object.entries(api.post)) {
    app.post(`/api${key}`, value)
}

// main page
app.get("/", (req, res) => { res.sendFile("website/index.html", { root: "." }) })
app.get("/index.js", (req, res) => { res.sendFile("/website/index.js", { root: "." }) })
app.get("/index.css", (req, res) => { res.sendFile("/website/index.css", { root: "." }) })

// auth
app.get("/discord_auth_redirect_login", (req, res) => {
    res.redirect(process.env.login_url)
})


app.get("/discord_auth", (req, res) => {
    if (req.query.error) {
        res.redirect("/")
    }

    const code = req.query.code;
    const params = new URLSearchParams();
    params.append('client_id', process.env.clientId);
    params.append('client_secret', process.env.clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.redirect_uri);

    fetch('https://discord.com/api/oauth2/token', { method: "POST", body: params }).then(res => res.json()).then(data => {
        if (data.token_type != null && data.access_token != null) {
            const token = `${data.token_type} ${data.access_token}`

            res.cookie('token', token, { maxAge: data.expires_in * 1000 });
        }

        res.redirect("/")
    })
})

app.get("/logout", (req, res) => {
    res.cookie('token', "", { maxAge: 0 });
    res.redirect("/")
})

// 404 
app.use((req, res) => {
    res.status(404)
    res.send("404 not found")
})

// run server
app.listen(process.env.port, () => {
    console.log(`server on localhost:${process.env.port}`)
})
