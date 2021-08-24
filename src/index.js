const { randomIndex, randomEntry } = require("./util");
const { combinations, sentences, social } = require("./data.json");

function renderDrama(message, share, sharePath, teaser) {
    return `
<html>
    <head>
        <title>RiiConnect24 Drama Generator</title>
        <meta name="description" content="${message}" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="og:title" content="${teaser}"/>
        <meta name="og:type" content="website"/>
        <meta name="og:url" content="${share}"/>
        <meta name="og:site_name" content="RiiConnect24 Drama Generator"/>
        <meta name="og:description" content="${message}"/>

        <link rel="icon" href="data:,">
        <style>
            body {
                font-family: sans-serif;
                text-align: center;
            }
            #more:visited {
                color: blue;
            }
        </style>
        <script>
            const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
            const inputs = ["", "", "", "", "", "", "", "", "", ""]

            function pushInput(key) {
                inputs.shift();
                inputs.push(key);
            }

            function checkInputs() {
                for (i in inputs) {
                    if (konami[i] != inputs[i]) {
                        return false;
                    }
                }
                return true;
            }

            function onLoad() {
                window.history.replaceState({}, "", "${sharePath}");
            }

            function onKeyDown(e) {
                pushInput(e.key);

                if (checkInputs()) {
                    document.getElementById("fight").innerHTML = "<img src=\\"https://media1.tenor.com/images/747305f3c5cbcb6bce00b9bea17a7978/tenor.gif\\" alt=\\"FIIIIIIGHT!\\"/>"
                }

                if (e.key == "Enter") {
                    window.location = "/";
                }
            }

            window.onload = onLoad;
            window.onkeydown = onKeyDown;
        </script>
    </head>
    <body>
        <h3>RiiConnect24 Drama Generator</h3>
        <h1>${message}</h1>
        <span id="fight"></span>
        <h6>
            <a id="more" href="/">Generate more drama!</a> (or press enter)
            <br />
            <br />
            This website is made in jest - don't take it too seriously!
            <br />
            Developed by mdcfe. Edited by Artuto; PRs welcome on <a href="https://github.com/Artuto/rc24-drama-generator">GitHub</a>.
            <br />
            Credits to the <a href="https://drama.essentialsx.net/">Spigot Drama Generator</a>.
            Inspired by (and heavily borrows from) <a href="https://github.com/asiekierka/MinecraftDramaGenerator/">asiekierka's Minecraft Drama Generator</a>.
            <br />
            <br />
            <!--<i>Unofficial alternative forms: <a href="https://api.chew.pro/spigotdrama">Chew's JSON API</a> | <a href="https://twitter.com/SpigotDrama">Twitter bot</a></i>-->
        </h6>
    </body>
</html>
    `
}

function handleRoot(url) {
    let drama = {};

    drama.sentence = randomIndex(sentences);

    for (key in combinations) {
        drama[key] = [randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key])];
    }

    const dramaUrl = btoa(JSON.stringify(drama));
    const host = url.host == "example.com" ? "localhost:8787" : url.host;

    return handleDrama(new URL(`${url.protocol}//${host}/${dramaUrl}`));
}

function handleDrama(url) {
    try {
        let dramaIds = JSON.parse(atob(url.pathname.split("/")[1]));
        let usedDramaIds = { sentence: dramaIds.sentence };
        let message = sentences[dramaIds.sentence];

        for (key in combinations) {
            const placeholder = `[${key}]`;
            if (!message.includes(placeholder)) continue;
            usedDramaIds[key] = [];
            for (id of dramaIds[key]) {
                if (!message.includes(placeholder)) continue;
                usedDramaIds[key].push(id);

                const replacement = combinations[key][id];
                message = message.replace(placeholder, replacement);
            }
        }

        url.pathname = "/" + btoa(JSON.stringify(usedDramaIds));

        let teaser = randomEntry(social);

        return new Response(renderDrama(message, url.href, url.pathname, teaser), {
            headers: {
                "content-type": "text/html;charset=utf8"
            }
        });
    } catch (error) {
        console.trace(error.stack);
        return handle404();
    }
}

function handle404() {
    return new Response("no u", {
        status: "404"
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    let url = new URL(request.url);
    if (url.pathname == "/") {
        return handleRoot(url);
    } else if (url.pathname == "/favicon.ico") {
        return handle404();
    } else {
        return handleDrama(url);
    }
}
