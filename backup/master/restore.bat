..\..\..\PostgreSQL\bin\pg_dump -c -C --column-inserts --serializable-deferrable -U postgres -h localhost -p 5432 test > arhiv\before_restore.sql
..\..\..\PostgreSQL\bin\psql -U postgres test < dropall.sql
..\..\..\PostgreSQL\bin\psql -U postgres < arhiv\db_last.sql
