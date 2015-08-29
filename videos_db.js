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
    },

    saveVideoTags: function(id, newTags) {
        var db = new sqlite3.Database('hvcm.sqlite');
        module.exports.getVideoTags(id, function(oldTagRows) {
            var oldTags = [];
            oldTagRows.forEach(function(row) {
                oldTags.push(row.name);
            });
            newTags.forEach(function(newTag) {
                var insertStatement = db.prepare("INSERT INTO tags(video_id, name, added_at) VALUES(?, ?, ?)");
                if (oldTags.indexOf(newTag) === -1) {
                    db.serialize(function() {
                        insertStatement.run(id, newTag, Math.floor(Date.now() / 1000));
                    });
                }
            });
            oldTags.forEach(function(oldTag) {
                var deleteStatement = db.prepare("DELETE FROM tags WHERE video_id = ? AND name = ?");
                if (newTags.indexOf(oldTag) === -1) {
                    db.serialize(function() {
                        deleteStatement.run(id, oldTag);
                    });
                }
            });
        });
    },

    updateLastOpenedAt: function(id) {
        var db = new sqlite3.Database('hvcm.sqlite');

        db.serialize(function() {
          db.run("UPDATE videos SET last_opened_at = " + Math.floor(Date.now() / 1000) + " WHERE id = " + id);
        });

        db.close();
    }
};
