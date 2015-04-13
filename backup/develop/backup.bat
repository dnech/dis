REM script to backup PostgresSQL databases
REM @ECHO off

SET day=%DATE:~0,2%
SET month=%DATE:~3,2%
SET year=%DATE:~6,4%
SET hour=%TIME:~0,2%
SET minute=%TIME:~3,2%
SET second=%TIME:~6,2%
SET dt=%year%%month%%day%%hour%%minute%%second%
SET db=test
SET bk1=arhiv\db_last.sql
SET bk2=arhiv\db_%dt%.sql

REM ECHO off
..\..\..\PostgreSQL\bin\pg_dump -c -C --column-inserts --serializable-deferrable -U postgres -h localhost -p 5432 %db%  > %bk1%
..\..\..\PostgreSQL\bin\pg_dump -c -C --column-inserts --serializable-deferrable -U postgres -h localhost -p 5432 %db%  > %bk2%
