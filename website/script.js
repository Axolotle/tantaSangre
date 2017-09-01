

function readFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (this.readyState === 4 && this.status == 200) {
            callback(this.responseText);
        }
    }
    rawFile.send(null);
    return;
}

/*┌─────────────────────────────────────────────────┐
  │  ╭─╴┌─╴╭─╴╶┬╴╶┬╴╭─╮╭╮╷╭─╴   ╷  ╭─╮╭─┐┌─╮┌─╴┌─╮  │
  │  ╰─╮├─╴│   │  │ │ ││││╰─╮   │  │ │├─┤│ │├─╴├┬╯  │
  │  ╶─╯╰─╴╰─╴ ╵ ╶┴╴╰─╯╵╰╯╶─╯   ╰─╴╰─╯╵ ╵└─╯╰─╴╵ ╰  │
  └─────────────────────────────────────────────────┘*/

function loadSection(a) {
    var target = document.getElementById("appendZone");

    var filename = a.target ? a.target.id : a;

    readFile("html/"+filename+".html", function(content) {
        target.innerHTML = content;
        if (filename == "journal")
            setupListener();
            // put vertical imgs if screen is vertical
            if (window.innerWidth < window.innerHeight) {
                changeImgs();
            }

    });
}

var links = document.getElementsByClassName("menu");

for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", loadSection);
}

loadSection("journal");
var targs, previousTarg;


function showEpisode(a) {
    var toShow = document.getElementsByClassName("episode");

    var i;
    if (a.target.tagName != "DIV")
        i = Array.prototype.indexOf.call(targs, a.target.parentNode);
    else
        i = Array.prototype.indexOf.call(targs, a.target);

    var display = toShow[i].style.display;

    if (previousTarg != undefined && previousTarg != i) {
        //toShow[previousTarg].style.display = "none";
        hideElem(toShow[previousTarg], 500);
    }

    if (display == "none" || display == "") {
        //toShow[i].style.display = "block";
        showElem(toShow[i], 500);
        previousTarg = i;
    }
    else {
        hideElem(toShow[i], 500);
        //toShow[i].style.display = "none";
    }
}




function setupListener() {
    targs = document.getElementsByClassName("target");
    for (var i = 0; i < targs.length; i++) {
        targs[i].addEventListener("click", showEpisode);
    }
}

function changeImgs() {
    var imgs = document.getElementsByTagName("img");
    for (let i = 0; i < imgs.length; i++) {
        let idx = imgs[i].src.indexOf("-H");
        if (idx > -1) {
            let newSrc = imgs[i].src.replace("-H", "-V");
            imgs[i].src = newSrc;
        }
    }
}

function showElem(element, duration) {

    var mesure = "px";
    var startHeight = 0;
    var maxHeight = 600;

    if (duration < 0) {
        return Promise.reject("bad duration");
    }
    if (duration === 0) {
        element.style.display = "block";
        element.style.height = maxHeight + mesure;
        return Promise.resolve();
    }

    element.style.display = "block";
    element.style.height = startHeight+mesure;

    var start_time = Date.now();
    var end_time = start_time + duration;

    var smooth_step = function smooth_step(start, end, point) {
        if(point <= start) { return 0; }
        if(point >= end) { return 1; }
        var x = (point - start) / (end - start); // interpolation
        return x*x*(3 - 2*x);
    }
    function getInt(str) {
        return parseInt(str.replace(mesure, ""));
    }

    return new Promise(function(resolve, reject) {
        var previousHeight = getInt(element.style.height);

        var show_frame = function() {
            var elemHeight = getInt(element.style.height);

            if(elemHeight != previousHeight) {
                reject("interrupted");
                return;
            }
            // set the scrollTop for this frame
            var now = Date.now();
            var point = smooth_step(start_time, end_time, now);
            var frameHeight = Math.round(startHeight + (maxHeight * point));
            element.style.height = frameHeight + mesure;

            // check if we're done!
            if(now >= end_time) {
                resolve();
                return;
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done; not
            // interrupted.
            if(element.style.height === previousHeight
                && element.style.height !== frameHeight) {
                return;
            }

            previousHeight = getInt(element.style.height);

            // schedule next frame for execution
            setTimeout(show_frame, 0);
        }

        // boostrap the animation process
        setTimeout(show_frame, 0);

    });

}
function hideElem(element, duration) {
    function getInt(str) {
        return parseInt(str.replace(mesure, ""));
    }

    var mesure = "px";
    var startHeight = getInt(element.style.height);
    var minHeight = 0;

    if (duration < 0) {
        return Promise.reject("bad duration");
    }
    if (duration === 0) {
        element.style.display = "none";
        element.style.height = minHeight + mesure;
        return Promise.resolve();
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var smooth_step = function(start, end, point) {
        if(point <= start) { return 0; }
        if(point >= end) { return 1; }
        var x = (point - start) / (end - start); // interpolation
        return x*x*(3 - 2*x);
    }

    return new Promise(function(resolve, reject) {
        var previousHeight = getInt(element.style.height);

        var show_frame = function() {
            var elemHeight = getInt(element.style.height);

            if(elemHeight != previousHeight) {
                reject("interrupted");
                return;
            }
            // set the scrollTop for this frame
            var now = Date.now();
            var point = smooth_step(start_time, end_time, now);

            var frameHeight = Math.round(startHeight-(startHeight * point));
            element.style.height = frameHeight + mesure;

            // check if we're done!
            if(now >= end_time) {
                element.style.display = "none";

                resolve();
                return;
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done; not
            // interrupted.
            if(element.style.height === previousHeight
                && element.style.height !== frameHeight) {
                return;
            }

            previousHeight = getInt(element.style.height);

            // schedule next frame for execution
            setTimeout(show_frame, 0);
        }

        // boostrap the animation process
        setTimeout(show_frame, 0);

    });

}
