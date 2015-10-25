#!/usr/bin/ruby

require 'sqlite3'

unless ARGV.size == 1
  puts "Usage: delete_by_tag.rb TAG"
  exit 1
end

def delete_by_tag(db, tag)
  puts "Deleting tag: #{tag}."
  db.execute('SELECT videos.id, path FROM videos INNER JOIN tags ON videos.id = tags.video_id WHERE tags.name = ?', tag).each do |entry|
    video_id = entry[0]
    path = entry[1]
    if File.exists?(path)
      puts "Deleting file: #{path}."
      File.delete(path)
    else
      puts 'File already deleted.'
    end
    puts "Deleting video with id = #{video_id}."
    db.execute('DELETE FROM videos WHERE id = ?', video_id)
  end
  puts 'Finished.'
end

db = SQLite3::Database.new 'hvcm.sqlite'
delete_by_tag(db, ARGV[0])
