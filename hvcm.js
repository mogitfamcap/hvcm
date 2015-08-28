var video = require('./video.js');

window.onload = function() {
};

function drawVideos() {
    var result = "";
    getVideos(function(videos) {
        videos.forEach(function(video) {
            console.log("Video");
            result += "<tr><td>" + video.name + "</td><td>" + video.path + "</td></tr>";
        });
        $('#videos-table-body').html(result);
    });
}

function getVideos(onVideosReceived) {
    var sqlite3 = require('sqlite3');
    var db = new sqlite3.Database('hvcm.sqlite');
    var result = [];

    db.serialize(function() {
        db.each(
          "SELECT path, created_at, added_at, last_opened_at FROM videos",
          function(err, row) {
              if (err) {
                  console.log('Error: ' + err);
              } else {
                  v = row;
                  result.push({name: video.name(v.path), path: v.path});
              }
          },
          function() {
              onVideosReceived(result);
          }
      );
    });

    db.close();
}
