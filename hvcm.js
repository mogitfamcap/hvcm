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
          "SELECT name, path FROM videos",
          function(err, row) {
              result.push({name: row.name, path: row.path});
          },
          function() {
              onVideosReceived(result);
          }
      );
  });

    db.close();
}
