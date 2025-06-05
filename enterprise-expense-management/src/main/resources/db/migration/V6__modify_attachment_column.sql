-- Modify attachment column to use longblob for larger files
ALTER TABLE expenses MODIFY COLUMN attachment LONGBLOB; 