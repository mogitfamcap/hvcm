var video = require('./video.js');
var videosDb = require('./videos_db.js');

window.onload = function() {
};

function drawVideos() {
    var result = "";
    videosDb.getAll(function(videos) {
        videos.forEach(function(v) {
            var name = video.name(v.path);
            var nameHref = '<a href="#" onclick="onVideoClicked(' + v.id + ');">' + name + '</a>';
            result += "<tr><td>" + nameHref + "</td><td>" + v.path + "</td></tr>";
        });
        $('#videos-table-body').html(result);
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
