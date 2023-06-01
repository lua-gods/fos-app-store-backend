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

// new app
function newFosApp() {
    const data = {
        name: "my app"
    }

    fetch("./api/newApp", {
        method:"POST",
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

    button.disabled = true
}

// buttons for app lists
async function generateAppListButtons() {
    const list = await fetch("./api/list", { method: "GET" }).then(res => res.text()).then(data => data.split("\n"))

    const appList = document.getElementById("appList")
    appList.innerHTML = ""

    const buttons = []

    for (let i = 0; i < list.length; i++) {
        const data = list[i].match("^([^;]*);([^;]*);(.*)")

        if (data && data[1] && data[3] && data[2] == myId) {
            const button = document.createElement("button")
            button.textContent = data[3]
            
            button.onclick = function () {
                button_action(button, data[1], buttons)
            }
            
            appList.appendChild(button)

            buttons.push(button)
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

