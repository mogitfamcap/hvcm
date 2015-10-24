#!/usr/bin/ruby

require 'sqlite3'

unless ARGV.size == 2
  puts "Usage: rename_tag.rb OLD_NAME NEW_NAME"
  exit 1
end

def rename(db, old_name, new_name)
  puts "Renaming #{old_name} to #{new_name}."
  db.execute('SELECT video_id FROM tags WHERE name = ?', old_name).each do |entry|
    video_id = entry[0]
    puts "Video id: #{video_id}"
    if db.execute('SELECT * FROM tags WHERE video_id = ? AND name = ?', video_id, new_name).any?
      puts 'Tag with new name is already present. Deleting old name.'
      db.execute('DELETE FROM tags WHERE video_id = ? AND name = ?', video_id, old_name)
    else
      puts 'Updating tag.'
      db.execute('UPDATE tags SET name = ? WHERE video_id = ? AND name = ?', new_name, video_id, old_name)
    end
  end
  puts 'Finished renaming.'
end


db = SQLite3::Database.new 'hvcm.sqlite'
rename(db, ARGV[0], ARGV[1])
