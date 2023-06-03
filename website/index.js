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
let myUsername = ""
let selectedApp = null
let myApps = {}
let buttons = null
const appName = document.getElementById("appName")
const appDescription = document.getElementById("appDescription")
const appCode = document.getElementById("appCode")
const appUpdate = document.getElementById("appUpdate")
const appDelete = document.getElementById("appDelete")
const username = document.getElementById("username")

// popup
function openPopup() {
    const popup = document.getElementById("popup")
    const popupBox = document.getElementById("popupBox")

    popup.style.display = "flex"

    popup.style.animation = "popupAnimOpen 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
    popupBox.style.animation = "popupAnimBoxOpen 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
}

function closePopup() {
    const popup = document.getElementById("popup")
    const popupBox = document.getElementById("popupBox")
    
    popup.style.animation = "popupAnimClose 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
    popupBox.style.animation = "popupAnimBoxClose 0.5s cubic-bezier(0.25, 1, 0.5, 1)"

    setTimeout(() => {
        popup.style.display = "none"
    }, 500)
}

document.getElementById("buttonNo").onclick = function() {
    closePopup()
}

document.getElementById("buttonYes").onclick = function() {
    closePopup()

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
            unselectApp()
            generateAppListButtons()
        }
    })
}

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
function button_action(button, id) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false
        buttons[i].classList.remove("buttonSelectedApp")
    }

    if (selectedApp) {
        buttons[myApps[selectedApp][4]].textContent = myApps[selectedApp][2]
    }

    selectedApp = id
    button.disabled = true
    button.classList.add("buttonSelectedApp")

    fetch(`./api/getApp?id=${id}`, {
        method: "GET"
    }).then(res => res.text()).then((text) => {
        myApps[selectedApp][3] = text

        fetch(`./api/getDescription?id=${id}`, {
            method: "GET"
        }).then(res => res.text()).then((text) => {
            myApps[selectedApp][5] = text
    
            selectApp()
        })
    })
}

function selectApp() {
    appName.disabled = false
    appName.value = myApps[selectedApp][2]

    appCode.disabled = false
    appCode.value = myApps[selectedApp][3]

    appDescription.disabled = false
    appDescription.value = myApps[selectedApp][5]

    appUpdate.disabled = false

    appDelete.disabled = false
}

function unselectApp() {
    appName.disabled = true
    appName.value = ""

    appCode.disabled = true
    appCode.value = ""

    appDescription.disabled = true
    appDescription.value = ""

    appUpdate.disabled = true

    appDelete.disabled = true

    selectedApp = null
}

// buttons for app lists
async function generateAppListButtons() {
    const list = await fetch("./api/list", { method: "GET" }).then(res => res.text()).then(data => data.split("\n"))

    const appList = document.getElementById("appList")
    appList.innerHTML = ""

    buttons = []
    myApps = {}

    for (let i = 0; i < list.length; i++) {
        const data = list[i].match(/^([^;]*);([^;]*);(.*)/)
        // 0 = id, 1 = owner, 2 = name, 3 = code, 4 = button id, 5 = app description

        if (data && data[1] && data[3] && data[2] == myId) {
            data.splice(0, 1);

            const button = document.createElement("button")
            button.textContent = data[2]
            button.onclick = function () { button_action(button, data[0]) }
            appList.appendChild(button)

            buttons.push(button)

            myApps[data[0]] = data

            data[4] = buttons.length - 1

            if (selectedApp == data[0]) {
                button.classList.add("buttonSelectedApp")
                button.disabled = true
            }
        }
    }

    const button = document.createElement("button")
    button.textContent = "new app"
    button.classList.add("buttonGreen")
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

    fetch("./api/id", {
        method: "GET",
        headers: {
            authorization: getCookie("token")
        }
    }).then(res => res.text()).then((id) => {
        myId = id
        generateAppListButtons()
    })

    fetch("./api/getName", {
        method: "GET",
        headers: {
            authorization: getCookie("token")
        }
    }).then(res => res.text()).then((name) => {
        myUsername = name
        username.value = name
        username.disabled = false
    })
}

// update app
appUpdate.onclick = function () {
    const data = {
        name: appName.value,
        code: appCode.value,
        description: appDescription.value,
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
            // update
            buttons[myApps[selectedApp][4]].textContent = appName.value
            myApps[selectedApp][2] = appName.value
        }
    })
}

// delete
appDelete.onclick = function () {
    const textElement = document.getElementById("popupText")

    textElement.innerText = `Are you sure you want to remove\n${myApps[selectedApp][2]}`

    openPopup()
}

// username change
function updateUsernameConfirm() {
    const usernameConfirm = document.getElementById("usernameConfirm")

    const wasEnabled = usernameConfirm.style.display != "none"
    const shouldEnable = username.value != myUsername

    if (shouldEnable == wasEnabled) {
        return
    }
    
    if (shouldEnable) {
        usernameConfirm.style.animation = "usernameChangeOpen 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
        usernameConfirm.style.display = "block"
    } else {
        usernameConfirm.style.animation = "usernameChangeClose 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
        setTimeout(() => {
            usernameConfirm.style.display = "none"
        }, 480)
    }
}

username.addEventListener("input", updateUsernameConfirm)
username.addEventListener("keup", updateUsernameConfirm)
username.addEventListener("kedown", updateUsernameConfirm)

document.getElementById("usernameButtonCancel").onclick = function() {
    username.value = myUsername
    updateUsernameConfirm()
}

document.getElementById("usernameButtonConfirm").onclick = function() {
    const data = {
        name: username.value
    }

    fetch("./api/setName", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: getCookie("token")
        },
        body: JSON.stringify(data)
    }).then(async (res) => {
        if (res.status == 200) {
            const text = await res.text()
            myUsername = text
            username.value = text
            updateUsernameConfirm()
        } else {
            username.value = myUsername
        }
    })
}