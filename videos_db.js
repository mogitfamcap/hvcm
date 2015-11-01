var sqlite3 = require('sqlite3');

module.exports = {
    getAll: function(callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        var result = [];

        db.serialize(function() {
            db.each(
              "SELECT id, path, times_opened, created_at, added_at, last_opened_at FROM videos",
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

    getByIds: function(ids, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        var result = [];

        db.serialize(function() {
            var statement = "SELECT id, path, rating, times_opened, created_at, added_at, last_opened_at FROM videos WHERE id IN (" + ids + ")";
            db.each(
              statement,
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

    getAllVideoIds: function(callback) {
        module.exports.getAll(function(videos) {
            var result = [];
            videos.forEach(function(v) {
                result.push(v.id);
            });
            callback(result);
        });
    },

    getVideoIdsByStatement: function(statement, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        var result = [];
        db.serialize(function() {
            db.each(
              statement,
              function(err, row) {
                  if (err) {
                      console.log('Error: ' + err);
                  } else {
                      result.push(row.id);
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
              "SELECT id, path, notes, rating, times_opened, created_at, added_at, last_opened_at FROM videos WHERE id = " + id,
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

    saveVideoTags: function(id, newTags, callback) {
        saveVideoAttributes(id, 'tags', newTags, callback);
    },

    getVideoCast: function(id, callback) {
        getVideoAttributes(id, 'cast', callback);
    },

    getAllTags: function(callback) {
        getAllAttributes('tags', callback);
    },

    getAllCast: function(callback) {
        getAllAttributes('cast', callback);
    },

    saveVideoCast: function(id, newCast, callback) {
        saveVideoAttributes(id, 'cast', newCast, callback);
    },

    saveVideoNotes: function(id, notes, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        db.serialize(function() {
          db.run("UPDATE videos SET notes = '" + notes + "' WHERE id = " + id);
        });
        db.close(function() {
            if (typeof callback !== 'undefined') {
                callback();
            }
        });
    },

    saveVideoRating: function(id, rating, callback) {
        var db = new sqlite3.Database('hvcm.sqlite');
        db.serialize(function() {
          db.run("UPDATE videos SET rating = " + rating + " WHERE id = " + id);
        });
        db.close(function() {
            if (typeof callback !== 'undefined') {
                callback();
            }
        });
    },

    logOpened: function(id) {
        var db = new sqlite3.Database('hvcm.sqlite');

        db.serialize(function() {
          db.run("UPDATE videos SET last_opened_at = " + Math.floor(Date.now() / 1000) + ", times_opened = times_opened + 1 WHERE id = " + id);
        });
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

function getAllAttributes(attributeTableName, callback) {
    var db = new sqlite3.Database('hvcm.sqlite');
    var result = [];
    db.serialize(function() {
        db.each(
          "SELECT name, video_id FROM " + attributeTableName,
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
}

function saveVideoAttributes(videoId, attributeTableName, newAttributes, callback) {
    getVideoAttributes(videoId, attributeTableName, function(oldAttributeRows) {
        var db = new sqlite3.Database('hvcm.sqlite');
        db.serialize(function() {
            var oldAttributes = [];
            oldAttributeRows.forEach(function(row) {
                oldAttributes.push(row.name);
            });
            var insertStatement = db.prepare("INSERT INTO " + attributeTableName + "(video_id, name, added_at) VALUES(?, ?, ?)");
            newAttributes.forEach(function(newAttribute) {
                if (oldAttributes.indexOf(newAttribute) === -1) {
                    insertStatement.run(videoId, newAttribute, Math.floor(Date.now() / 1000));
                }
            });
            insertStatement.finalize();
            var deleteStatement = db.prepare("DELETE FROM " + attributeTableName + " WHERE video_id = ? AND name = ?");
            oldAttributes.forEach(function(oldAttribute) {
                if (newAttributes.indexOf(oldAttribute) === -1) {
                    db.serialize(function() {
                        deleteStatement.run(videoId, oldAttribute);
                    });
                }
            });
            deleteStatement.finalize();
        });
        db.close(function() {
            if (typeof callback !== 'undefined') {
                callback();
            }
        });
    });
}
