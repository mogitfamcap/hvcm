var sqlite3 = require('sqlite3');

module.exports = {
    getAll: function(callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        var result = [];

        db.serialize(function() {
            db.each(
              "SELECT id, path, created_at, added_at, last_opened_at FROM videos",
              function(err, row) {
                  if (err) {
                      console.log('Error: ' + err);
                  } else {
                      result.push(row);
                  }
              },
              function() {
                  callback(result);
              }
            );
        });
        db.close();
    },

    getVideo: function(id, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        db.serialize(function() {
            db.each(
              "SELECT id, path, created_at, added_at, last_opened_at FROM videos WHERE id = " + id,
              function(err, row) {
                  if (err) {
                      console.log('Error: ' + err);
                  } else {
                      callback(row);
                  }
              }
            );
        });
        db.close();
    },

    getVideoTags: function(id, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        var result = [];
        db.serialize(function() {
            db.each(
              "SELECT id, name FROM tags WHERE video_id = " + id,
              function(err, row) {
                  if (err) {
                      console.log('Error: ' + err);
                  } else {
                      result.push({id: row.id, name: row.name});
                  }
              },
              function() {
                  callback(result);
              }
            );
        });
        db.close();
    },

    updateLastOpenedAt: function(id) {
        var db = new sqlite3.Database('hvcm.sqlite');

        db.serialize(function() {
          db.run("UPDATE videos SET last_opened_at = " + Math.floor(Date.now() / 1000) + " WHERE id = " + id);
        });

        db.close();
    }
};
