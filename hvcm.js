var video = require('./video.js');
var videosDb = require('./videos_db.js');

window.onload = function() {
    drawVideos();
};

function drawVideos() {
    $('#table-view').show();
    $('#video-view').hide();

    var result = "";
    videosDb.getAll(function(videos) {
        videos.forEach(function(v) {
            var name = video.name(v.path);
            var play = '<a href="#" onclick="playVideo(' + v.id + ');">' + 'Play' + '</a>';
            var details = '<a href="#" onclick="videoDetails(' + v.id + ');">' + name + '</a>';
            result += "<tr>"
            result += "<td>" + play + "</td>";
            result += "<td>" + details + "</td>";
            result += "<td>" + '<div><input type="text" id="video-list-tags-' + v.id + '" value="" data-role="tagsinput"/></div>' + "</td>"; // Tags
            result += "<td>" + '' + "</td>"; // Cast
            result += "<td>" + formatTimestamp(v.last_opened_at) + "</td>";
            result += "<td>" + formatTimestamp(v.created_at) + "</td>";
            result += "<td>" + formatTimestamp(v.added_at) + "</td>";
            result += "</tr>"
        });
        $('#videos-table-body').html(result);
        $("#videos-table").tablesorter();

        videos.forEach(function(v) {
            populateVideoTags(v.id, $('#video-list-tags-' + v.id));
        });
    });
}

function playVideo(id) {
    videosDb.getVideo(id, function(v) {
        var exec = require('child_process').exec;
        var cmd = 'vlc "' + v.path + '"';
        console.log("Command: " + cmd);
        exec(cmd, function(error, stdout, stderr) {
        });
        videosDb.updateLastOpenedAt(id);
    });
}

function videoDetails(id) {
    videosDb.getVideo(id, function(v) {
        $('#video-name').html(video.name(v.path));
        $('#video-cast').html('');
        $('#video-last-opened-at').html(formatTimestamp(v.last_opened_at));
        $('#video-created-at').html(formatTimestamp(v.created_at));
        $('#video-added-at').html(formatTimestamp(v.added_at));

        $('#button-play').unbind('click');
        $('#button-play').attr('onclick', '').click(function() {
            playVideo(id);
        });

        $('#button-save').unbind('click');
        $('#button-save').attr('onclick', '').click(function() {
            saveVideo(id);
        });

        populateVideoTags(id, $('#video-tags-input'));
        $('#table-view').hide();
        $('#video-view').show();
    });
}

function saveVideo(id) {
    saveTags(id);
}

function saveTags(id) {
    var tags = $('#video-tags-input').tagsinput('items');
    videosDb.saveVideoTags(id, tags);
}

function populateVideoTags(id, element) {
    element.tagsinput();
    element.tagsinput('removeAll');
    videosDb.getVideoTags(id, function(tags) {
        tags.forEach(function(tag) {
            element.tagsinput('add', tag.name);
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

    var str = date.getFullYear() + "/" + month + "/" + day + " " +  hour + ":" + min + ":" + sec;

    return str;
}
