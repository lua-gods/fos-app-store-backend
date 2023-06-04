const fetch = require('node-fetch') // fetch

const auth = {}
module.exports = auth

const cache = {}

function timeoutCache(token) {
    delete cache[token]
}

auth.getId = async (token) => {
    if (token == "" || token == null) {
        return false
    }

    if (cache[token] != null) {
        return cache[token]
    }

    const res = await fetch("https://discord.com/api/oauth2/@me", {
        method: "GET",
        headers: {
            authorization: token
        }
    })
    
    if (res.status == 200) {
        const data = await res.json()
        
        if (data.application.id == process.env.clientId) {
            cache[token] = data.user.id
            setTimeout(timeoutCache, 1000 * 60 * 10, token)
            
            return data.user.id
        }
    }

    cache[token] = false
    setTimeout(timeoutCache, 1000 * 60, token)

    return false
}