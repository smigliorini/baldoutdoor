# Installazione e configurazione PostgreSQL

L'applicazione Baldoutdoor utilizza il DBMS PostgreSQL (https://www.postgresql.org/) con estensione PostGIS (https://postgis.net/)

L'installazione di PostgreSQL su server Ubuntu avviene con il seguente comando (versione di PostgreSQL attualmente installata 17):

```sudo -u postgres psql postgres```

Una volta installato si può accedere tramite il client psql e si può impostare la password per l'utente principale `postgres`

```
postgres=# \password postgres
# enter the password

# Close psql.
postgres=# \q
```

Va a questo punto aggiornato il file di configurazione (`/etc/postgresql/17/main/pg_hba.conf`) per sostituire il tipo di login da peer a md5

```
# As a super user, open /etc/postgresql/17/main/pg_hba.conf
local   all             all                                      md5

# restart PostgreSQL:
$ sudo service postgresql restart
```

# Creazione del database

Eseguire l'accesso a PostgreSQL tramite il client `psql`

```
psql --host=localhost --username=postgres --dbname=postgres
```

Creare un nuovo utente (sistituire `***` con la password configurata nell'applicazione server):

```
postgres=# create user tourism with password '***';
```

Creare il database `toursimdb` con proprietario l'utente `tourism` appena creato:

```
postgres=# grant all privileges on database tourismdb to tourism;
```

Connettersi al database `tourismdb` e assegnare all'utente `tourism` i privilegi necessari:

```
\c tourismdb
postgres=# grant all on schema public to tourism;
```





