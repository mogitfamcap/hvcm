#!/usr/bin/ruby

require 'sqlite3'

SUPPORTED_EXTNAMES = ['.avi', '.mp4', '.wmv', '.mkv', '.flv']

unless ARGV.size == 1
  puts "Usage: scan.rb PATH"
  exit 1
end

def add_file(path, db)
  puts "Processing file: #{path}"
  extname = File.extname(path)
  unless SUPPORTED_EXTNAMES.include?(extname)
    puts "Skipping. Invalid extension: #{extname}"
    return
  end

  created_at = File.ctime(path).to_i
  added_at = Time.now.to_i

  db.execute('INSERT INTO videos (path, created_at, added_at, last_opened_at)
              VALUES (?, ?, ?, ?)', [path, created_at, added_at, nil])
end

def scan(directory, db)
puts "Scaning directory #{directory}"
  Dir.glob("#{directory}/**/*".sub('//', '/')).each do |file_path|
    add_file(file_path, db)
  end
end

def create_db
  puts 'Creating DB'
  db = SQLite3::Database.new 'hvcm.sqlite'
  db.execute <<-SQL
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY,
      path varchar(200),
      created_at INTEGER,
      added_at INTEGER,
      last_opened_at INTEGER
    );
  SQL
  db
end

directory = ARGV[0].sub('//', '/')
db = create_db
scan(directory, db)
