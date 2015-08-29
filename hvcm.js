var video = require('./video.js');
var videosDb = require('./videos_db.js');

window.onload = function() {
    search();
};

function search() {
    var searchConditions = $('#search-input').tagsinput('items');
    if (searchConditions.length === 0) {
        videosDb.getAllVideoIds(function(videoIds) {
            drawVideos(videoIds);
        });
    } else {
        var statement = "";
        var first = true;
        searchConditions.forEach(function(condition) {
            if (!first) {
                statement += " INTERSECT ";
            }
            first = false;
            statement += "SELECT videos.id AS id FROM videos JOIN (SELECT * FROM tags UNION SELECT * FROM cast) AS attributes ON videos.id = attributes.video_id WHERE attributes.name='" + condition + "'";
        });
        console.log(statement);
        videosDb.getVideoIdsByStatement(statement, function(videoIds) {
            drawVideos(videoIds);
        });
    }
}

function drawVideos(ids) {
    $('#table-view').show();
    $('#video-view').hide();

    var result = "";
    videosDb.getByIds(ids, function(videos) {
        videos.forEach(function(v) {
            var name = video.name(v.path);
            var play = '<a href="#" onclick="playVideo(' + v.id + ');">' + 'Play' + '</a>';
            var details = '<a href="#" onclick="videoDetails(' + v.id + ');">' + name + '</a>';
            result += "<tr>"
            result += "<td>" + play + "</td>";
            result += "<td>" + details + "</td>";
            result += "<td>" + '<div><input type="text" id="video-list-tags-' + v.id + '" value="" data-role="tagsinput"/></div>' + "</td>";
            result += "<td>" + '<div><input type="text" id="video-list-cast-' + v.id + '" value="" data-role="tagsinput"/></div>' + "</td>";
            result += "<td>" + formatTimestamp(v.last_opened_at) + "</td>";
            result += "<td>" + formatTimestamp(v.created_at) + "</td>";
            result += "<td>" + formatTimestamp(v.added_at) + "</td>";
            result += "</tr>"
        });
        $('#videos-table-body').html(result);
        $("#videos-table").tablesorter();

        videos.forEach(function(v) {
            populateVideoTags(v.id, $('#video-list-tags-' + v.id));
            populateVideoCast(v.id, $('#video-list-cast-' + v.id));
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
        $('#video-notes-textarea').val(v.notes);
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
        populateVideoCast(id, $('#video-cast-input'));

        $('#table-view').hide();
        $('#video-view').show();
    });
}

function saveVideo(id) {
    saveNotes(id);
    saveTags(id);
    saveCast(id);
}

function saveNotes(id) {
    var notes = $('#video-notes-textarea').val();
    videosDb.saveVideoNotes(id, notes);
}

function saveTags(id) {
    var tags = $('#video-tags-input').tagsinput('items');
    videosDb.saveVideoTags(id, tags);
}

function saveCast(id) {
    var cast = $('#video-cast-input').tagsinput('items');
    videosDb.saveVideoCast(id, cast);
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

function populateVideoCast(id, element) {
    element.tagsinput();
    element.tagsinput('removeAll');
    videosDb.getVideoCast(id, function(cast) {
        cast.forEach(function(castMember) {
            element.tagsinput('add', castMember.name);
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
