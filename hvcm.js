var video = require('./video.js');
var videosDb = require('./videos_db.js');

window.onload = function() {
    drawVideos();
};

function drawVideos() {
    var result = "";
    videosDb.getAll(function(videos) {
        videos.forEach(function(v) {
            var name = video.name(v.path);
            var play = '<a href="#" onclick="onVideoClicked(' + v.id + ');">' + 'Play' + '</a>';
            result += "<tr>"
            result += "<td>" + play + "</td>";
            result += "<td>" + name + "</td>";
            result += "<td>" + '' + "</td>"; // Tags
            result += "<td>" + '' + "</td>"; // Cast
            result += "<td>" + formatTimestamp(v.last_opened_at) + "</td>";
            result += "<td>" + formatTimestamp(v.created_at) + "</td>";
            result += "<td>" + formatTimestamp(v.added_at) + "</td>";
            result += "</tr>"
        });
        $('#videos-table-body').html(result);
        $("#videos-table").tablesorter();
    });
}

function onVideoClicked(id) {
    console.log('Clicked video: ' + id);
    videosDb.getVideo(id, function(v) {
        var exec = require('child_process').exec;
        var cmd = 'vlc "' + v.path + '"';
        console.log("Command: " + cmd);
        exec(cmd, function(error, stdout, stderr) {
        });
    });
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }
    var date = new Date(timestamp * 1000);

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + "_" +  hour + ":" + min + ":" + sec;

    return str;
}
