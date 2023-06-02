// get cookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// useful variables
let myId = ""
let selectedApp = null
let myApps = {}
const appName = document.getElementById("appName")
const appCode = document.getElementById("appCode")
const appUpdate = document.getElementById("appUpdate")
const appDelete = document.getElementById("appDelete")

// new app
function newFosApp() {
    const data = {
        name: "my app"
    }

    fetch("./api/newApp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: getCookie("token")
        },
        body: JSON.stringify(data)
    }).then((res) => {
        if (res.status == 200) {
            generateAppListButtons()
        }
    })
}

// button action
function button_action(button, id, buttons) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false
    }

    selectedApp = id
    button.disabled = true

    fetch(`./api/getApp?id=${id}`, {
        method: "GET"
    }).then(res => res.text()).then((text) => {
        myApps[selectedApp][3] = text

        selectApp()
    })
}

function selectApp() {
    appName.disabled = false
    appName.value = myApps[selectedApp][2]

    appCode.disabled = false
    appCode.value = myApps[selectedApp][3]

    appUpdate.disabled = false

    appDelete.disabled = false
}

function unselectApp() {
    appName.disabled = true
    appName.value = ""

    appCode.disabled = true
    appCode.value = ""

    appUpdate.disabled = true

    appDelete.disabled = true

    selectedApp = null
}

// buttons for app lists
async function generateAppListButtons() {
    const list = await fetch("./api/list", { method: "GET" }).then(res => res.text()).then(data => data.split("\n"))

    const appList = document.getElementById("appList")
    appList.innerHTML = ""

    const buttons = []
    myApps = {}

    for (let i = 0; i < list.length; i++) {
        const data = list[i].match("^([^;]*);([^;]*);(.*)")
        // 0 = id, 1 = owner, 2 = name, 3 = code, 4 = button id
        
        if (data && data[1] && data[3] && data[2] == myId) {
            data.splice(0, 1);
            data[0] = parseInt(data[0])

            const button = document.createElement("button")
            button.textContent = data[2]

            button.onclick = function () {
                button_action(button, data[0], buttons)
            }

            appList.appendChild(button)

            buttons.push(button)

            myApps[data[0]] = data

            data[4] = buttons.length - 1

            if (selectedApp == data[0]) {
                button.disabled = true
            }
        }
    }

    const button = document.createElement("button")
    button.textContent = "new app"

    button.onclick = newFosApp

    appList.appendChild(button)
}

// check if there is user is logged in
if (getCookie("token") != "") {
    document.getElementById("notLoggedIn").style.display = "none"
    document.getElementById("loggedIn").style.display = "block"

    fetch("./api/id", {
        method: "GET",
        headers: {
            authorization: getCookie("token")
        }
    }).then(res => res.text()).then((id) => {
        myId = id

        generateAppListButtons()
    })
}

// update app
appUpdate.onclick = function() {
    const data = {
        name: appName.value,
        code: appCode.value,
        id: selectedApp
    }

    fetch("./api/updateApp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: getCookie("token")
        },
        body: JSON.stringify(data)
    }).then(async (res) => {
        if (res.status == 200) {
            console.log("app updated")
        } else {
            console.log("error", await res.text())
        }
    })
}

// delete
appDelete.onclick = function() {
    const data = {
        id: selectedApp
    }

    fetch("./api/deleteApp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: getCookie("token")
        },
        body: JSON.stringify(data)
    }).then(async (res) => {
        if (res.status == 200) {
            console.log("app deleted")
            unselectApp()
            generateAppListButtons()
            
        } else {
            console.log("error", await res.text())
        }
    })
}