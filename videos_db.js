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
        getVideoAttributes(id, 'tags', callback);
    },

    saveVideoTags: function(id, newTags) {
        saveVideoAttributes(id, 'tags', newTags);
    },

    updateLastOpenedAt: function(id) {
        var db = new sqlite3.Database('hvcm.sqlite');

        db.serialize(function() {
          db.run("UPDATE videos SET last_opened_at = " + Math.floor(Date.now() / 1000) + " WHERE id = " + id);
        });

        db.close();
    }
};

function getVideoAttributes(videoId, attributeTableName, callback) {
    var db = new sqlite3.Database('hvcm.sqlite');
    var result = [];
    db.serialize(function() {
        db.each(
          "SELECT id, name FROM " + attributeTableName + " WHERE video_id = " + videoId,
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
}

function saveVideoAttributes(videoId, attributeTableName, newAttributes) {
    var db = new sqlite3.Database('hvcm.sqlite');
    getVideoAttributes(videoId, attributeTableName, function(oldAttributeRows) {
        var oldAttributes = [];
        oldAttributeRows.forEach(function(row) {
            oldAttributes.push(row.name);
        });
        newAttributes.forEach(function(newAttribute) {
            var insertStatement = db.prepare("INSERT INTO " + attributeTableName + "(video_id, name, added_at) VALUES(?, ?, ?)");
            if (oldAttributes.indexOf(newAttribute) === -1) {
                db.serialize(function() {
                    insertStatement.run(videoId, newAttribute, Math.floor(Date.now() / 1000));
                });
            }
        });
        oldAttributes.forEach(function(oldAttribute) {
            var deleteStatement = db.prepare("DELETE FROM " + attributeTableName + " WHERE video_id = ? AND name = ?");
            if (newAttributes.indexOf(oldAttribute) === -1) {
                db.serialize(function() {
                    deleteStatement.run(videoId, oldAttribute);
                });
            }
        });
    });
}
