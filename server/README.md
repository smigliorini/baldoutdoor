# Configurazione ed installazione applicazione gestionale (server)
L'applicazione per la gestione delle informazioni turistiche [https://admin.baldoutdoor.it](https://admin.baldoutdoor.it) è stata realizzata in Python utilizzando il framework Django. 
L'applicazione è servita tramite l'application server [Apache HTTPD](https://httpd.apache.org/). 

Per poter eseguire l'applicazione è necessario:

Intallare Python 3 ed il tool PIP (attualmente sul server è stato installato Python 3.10.12):

```
sudo apt-get install libpq-dev python3-dev
sudo apt-get install python-pip3
```

Installare l'application server Apache HTTPD ed il modulo che ne consente la connessione con Python:

```
sudo apt-get install apache2 libapache2-mod-wsgi-py3
```

Abilitare il modulo installato tramite i seguenti comandi:

```
sudo a2enmod wsgi
```

Per ulteriori informazioni si può consulare la documentazione ufficiale di Django alla [pagina web relativa al modulo WSGI](https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/modwsgi/).

Una volta che l'installazione degli strumenti necessari è stata completata, si può procedere con il caricamento dell'applicazione in una directory servita da Apache HTTPD (nel caso specifico si assume essere `/var/www/python`). In particolare, si procederà a copiare all'interno di tale directory i file presente nella sezione `server` di questo GitHub. Sarà poi necessario:

1. Modificare il contenuto del file `PROGETTO/settings.py` insererendo la password del database.
2. Installare i pacchetti Python necessari al funzionamento dell'applicazione. L'installazione viene eseguita localmente al progetto (verrà creata una directory `venv` all'interno di `/var/www/python`) e non in modo globale, per evitare eventuali conflitti. I comandi seguenti vanno lanciati da dentro la directory `/var/www/python`. **Attenzione**: se il comando `pip3` genera degli errori, modificare temporaneamente i permessi della directory, **non** eseguire i comandi con `sudo`!

```
pip3 install django==3.2.6
pip3 install django-environ
pip3 install django-ckeditor
pip3 install django-tinymce
pip3 install django-richtextfield
pip3 install psycopg2
pip3 install pillow==10.3
```

3. Compilare l'applicazione Django per collezionare tutti i contenuti statici

```
sudo python3 manage.py collectstatic
```

Segue poi la creazione di un Virtual Host per l'applicazione su Apache HTTPD (creazione del file  `/etc/apache2/sites-available/010-python.conf`). Al fine di procedere con tale configurazione è necessario conoscere la directory in cui sarà installata l'applicazione (nel caso specifico si assume essere `/var/www/python`) e la directory in cui sono stati installati i certificati SSL (`/etc/apache2/ssl/`).

```
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.

        ServerName www.admin.baldoutdoor.it
        ServerAlias admin.baldoutdoor.it
        ServerAdmin webmaster@localhost

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        # LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # Redirect to HTTPS
        Redirect / https://admin.baldoutdoor.it
</VirtualHost>

<VirtualHost *:443>
        ServerName www.admin.baldoutdoor.it
        ServerAlias admin.baldoutdoor.it
        ServerAdmin webmaster@localhost

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        Protocols h2 http/1.1
        SSLCertificateFile /etc/apache2/ssl/star_baldoutdoor_it.crt
        SSLCertificateKeyFile /etc/apache2/ssl/star_baldoutdoor_it.key
        SSLCACertificateFile /etc/apache2/ssl/intermediate-baldoutdoor.crt

        Alias /media /var/www/python/media
        <Directory /var/www/python/media>
            Require all granted
        </Directory>

        Alias /static /var/www/python/static
        <Directory /var/www/python/static>
            Require all granted
        </Directory>

        <Directory /var/www/python/PROGETTO>
            <Files wsgi.py>
                Require all granted
            </Files>
        </Directory>

        WSGIDaemonProcess baldapp python-path=/var/www/python/
        WSGIProcessGroup baldapp
        WSGIScriptAlias /  /var/www/python/PROGETTO/wsgi.py
</VirtualHost>
```

Il Virtual Host creato va poi abilitato tramite il comando:

```
sudo a2ensite 010-python.conf
```

Infine, è necessario riavviare Apache HTTPD (si può preventivamente controllare la correttezza dei file di configurazione tramite: sudo apachectl `configtest`).

```
sudo service apache2 restart
```

### Note

Si fa presente che durante la fase di aggiornamento dell'applicazione (contenuto della directory `/var/www/python`) è necessario evitare di perdere/sovrascrivere le seguenti directory

* `venv`: contiene le librerie python necessarie all'applicazione. Va sovrascritta o aggiornata solo in caso di cambio delle librerie
* `media`: contiene le immagini caricate tramite l'applicazione, se si sovrascrive vengono perse!

### Cambio password utenti esistenti

La creazione e modifica di utenti avviene tramite il pannello di controllo di Django raggiungibile tramite il pulsante "Pannello di Controllo", ma l'eventuale cambio password di un utente esistente avviene tramite il comando

```
python3 manage.py changepassword <user_name>
```

da eseguire sul server all'interno della directory `/var/www/python`.

# Configurazione ed installazione GeoServer

L'installazione dell'applicazione GeoServer richiede la preventiva installazione dell'application server [Apache Tomcat 9](https://tomcat.apache.org/) e di Java.

```
sudo apt install openjdk-11-jre-headless
sudo apt install tomcat9 tomcat9-admin
```

I file di configurazione di Apache Tomcat si trovano nella directory `/etc/tomcat9`, mentre le applicazioni web sono installate nella directory `/var/lib/tomcat9/webapps`. Nello specifico si procederà a caricare l'applicativo GeoServer nella directory `/var/lib/tomcat9/webapps/ROOT`. Il software GeoServer può essere scaricato dall'indirizzo (https://geoserver.org/).

L'applicativo GeoServer disponibile all'indirizzo (https://gis.baldoutdoor.it) è servito da Apache Tomcat, utilizzando come interfaccia verso l'esterno Apache HTTPD. Per ottenere questo reindirizzamento, è necessario:

1. Installare i seguenti moduli per Apache HTTPD
   
```
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers 
```

2. Creare ed abilitare un Virtual Host Apache HTTPD per servire Apache Tomcat (creazione del file `/etc/apache2/sites-available/020-tomcat.conf`)

```
<VirtualHost *:80>
        ServerAdmin webmaster@baldoutdoor.it
        ServerName gis.baldoutdoor.it
        ServerAlias www.gis.baldoutdoor.it
        Header always set Content-Security-Policy "upgrade-insecure-requests"        

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        Redirect / https://gis.baldoutdoor.it/
</VirtualHost>

<VirtualHost *:443>
        ServerAdmin webmaster@baldoutdoor.it
        DocumentRoot /var/www/html2
        ServerName gis.baldoutdoor.it
        ServerAlias www.gis.baldoutdoor.it
        Header always set Content-Security-Policy "upgrade-insecure-requests"

        SSLProxyEngine on

        ProxyPreserveHost On
        ProxyPass / http://localhost:8080/
        ProxyPassReverse / http://localhost:8080/

        SSLCertificateFile /etc/apache2/ssl/star_baldoutdoor_it.crt
        SSLCertificateKeyFile /etc/apache2/ssl/star_baldoutdoor_it.key
        SSLCACertificateFile /etc/apache2/ssl/intermediate-baldoutdoor.crt
</VirtualHost>
```

3. Modificare i file di configurazione Apache Tomcat in modo da abilitare le richieste tramite proxy e permettere chiamate CORS (modificare il file di configurazione `/var/lib/tomcat9/webapps/ROOT/WEB-INF/web.xml`)

```
    ...  

    <!-- [2024-11-29] proxy configuration -->
    <context-param>
      <param-name>GEOSERVER_CSRF_WHITELIST</param-name>
      <param-value>gis.baldoutdoor.it</param-value>
    </context-param>

    ...

    <!-- Uncomment following filter to enable CORS in Tomcat. Do not forget the second config block further down. -->
    <filter>
       <filter-name>cross-origin</filter-name>
       <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
       <init-param>
         <param-name>cors.allowed.origins</param-name>
         <param-value>*</param-value>
       </init-param>
       <init-param>
         <param-name>cors.allowed.methods</param-name>
         <param-value>GET,POST,PUT,DELETE,HEAD,OPTIONS</param-value>
       </init-param>
       <init-param>
         <param-name>cors.allowed.headers</param-name>
         <param-value>*</param-value>
       </init-param>
    </filter>    

    ...

    <!-- Uncomment following filter-mapping to enable CORS -->
    <filter-mapping>
        <filter-name>cross-origin</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

## Aggiornamento Apache Tomcat 9

L'aggiornamento della versione di Apache Tomcat 9 ad una versione **minore** succcessiva, può avvenire semplicemente sovrascrivendo il contenuto delle directory

```
/usr/share/tomcat9/lib/
/usr/share/tomcat9/bin/
```

con quello presente nel pacchetto zip scaricato manualmente dal sito di Apache Tomcat per la versione desiderata.
    
