#!/usr/bin/ruby

require 'sqlite3'

SUPPORTED_EXTNAMES = ['.avi', '.mp4', '.wmv', '.mkv', '.flv', '.mov', '.mpeg', '.mpg']

unless ARGV.size == 1
  puts "Usage: scan.rb PATH"
  exit 1
end

def add_file(path, db)
  puts "Processing file: #{path}"

  if File.symlink?(path)
    puts "Skipping: symlink - #{path}"
    return
  end

  extname = File.extname(path)
  unless SUPPORTED_EXTNAMES.include?(extname)
    puts "Skipping: invalid extension: #{extname}"
    return
  end

  created_at = File.ctime(path).to_i
  added_at = Time.now.to_i

  if db.execute('SELECT * FROM videos WHERE path = ?', path).any?
    puts 'Skipping: already exists'
  else
    db.execute('INSERT INTO videos (path, created_at, added_at, last_opened_at)
                VALUES (?, ?, ?, ?)', [path, created_at, added_at, nil])
  end
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
      notes TEXT,
      created_at INTEGER,
      added_at INTEGER,
      last_opened_at INTEGER
    );
  SQL
  db.execute <<-SQL
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      video_id INTEGER,
      name varchar(200),
      added_at INTEGER
    );
  SQL
  db.execute <<-SQL
    CREATE TABLE IF NOT EXISTS cast (
      id INTEGER PRIMARY KEY,
      video_id INTEGER,
      name varchar(200),
      added_at INTEGER
    );
  SQL
  db
end

directory = ARGV[0].sub('//', '/')
db = create_db
scan(directory, db)
