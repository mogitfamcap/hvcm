var video = require('./video.js');
var videosDb = require('./videos_db.js');

var playerCommand = "vlc";

window.onload = function() {
    loadConfig();
    search();
};

function loadConfig() {
    try {
        var config = require('./config.json');
        if (typeof config['player_command'] !== 'undefined') {
            playerCommand = config['player_command'];
        }
    } catch (err) {
        console.log("Config not found.");
    }
}

function search() {
    var searchConditions = $('#search-input').tagsinput('items');
    var noTags = $('#search-no-tags').is(':checked');
    if (noTags) {
        var statement = "SELECT videos.id FROM videos LEFT JOIN tags ON videos.id = tags.video_id WHERE tags.id IS NULL";
        videosDb.getVideoIdsByStatement(statement, function(videoIds) {
            drawVideos(videoIds);
        });
        return;
    }
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

        videosDb.getAllTags(function(allTags) {
            videos.forEach(function(v) {
                populateVideoTags(v.id, $('#video-list-tags-' + v.id), allTags);
            });
        });
        videosDb.getAllCast(function(allCast) {
            videos.forEach(function(v) {
                populateVideoCast(v.id, $('#video-list-cast-' + v.id), allCast);
            });
        });
    });
}

function playVideo(id) {
    videosDb.getVideo(id, function(v) {
        var exec = require('child_process').exec;
        var cmd = playerCommand + ' "' + v.path + '"';
        console.log("Command: " + cmd);
        exec(cmd, function(error, stdout, stderr) {
        });
        videosDb.updateLastOpenedAt(id);
    });
}

function videoDetails(id) {
    videosDb.getVideo(id, function(v) {
        $('#video-name').html(video.name(v.path));
        $('#video-path').html(v.path);
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

        $('#button-save-and-home').unbind('click');
        $('#button-save-and-home').attr('onclick', '').click(function() {
            saveAndHome(id);
        });

        populateVideoTags(id, $('#video-tags-input'));
        populateVideoCast(id, $('#video-cast-input'));

        $('#table-view').hide();
        $('#video-view').show();
    });
}

function saveAndHome(id) {
    saveVideo(id, function() {
        search();
    });
}

function saveVideo(id, callback) {
    videosDb.saveVideoNotes(id, $('#video-notes-textarea').val(), function() {
        var tags = $('#video-tags-input').tagsinput('items');
        videosDb.saveVideoTags(id, tags, function() {
            var cast = $('#video-cast-input').tagsinput('items');
            videosDb.saveVideoCast(id, cast, function() {
                if (typeof callback !== 'undefined') {
                    callback();
                }
            });
        });
    });
}

function populateVideoTags(id, element, allTags) {
    element.tagsinput();
    element.tagsinput('removeAll');
    if (typeof allTags === 'undefined') {
        videosDb.getVideoTags(id, function(tags) {
            tags.forEach(function(tag) {
                element.tagsinput('add', tag.name);
            });
        });
    } else {
        allTags.forEach(function(tag) {
            if (tag.video_id === id) {
                element.tagsinput('add', tag.name);
            }
        });
    }
}

function populateVideoCast(id, element, allCast) {
    element.tagsinput();
    element.tagsinput('removeAll');
    if (typeof allCast === 'undefined') {
        videosDb.getVideoCast(id, function(cast) {
            cast.forEach(function(castMember) {
                element.tagsinput('add', castMember.name);
            });
        });
    } else {
        allCast.forEach(function(castMember) {
            if (castMember.video_id === id) {
                element.tagsinput('add', castMember.name);
            }
        });
    }
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
