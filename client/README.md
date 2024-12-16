# Configurazione ed installazione applicazione front-end (client)


L'applicazione front-end è stata realizzata utilizzando il framework [Ionic](https://ionicframework.com/) ed integrato con [React](https://react.dev/). L'applicazione è pertanto fruibile tramite web browser all'indirizzo [https://baldoutdoor.it](https://baldoutdoor.it), oppure scaricata dagli store Google e Apple.

Per poter generare l'applicazione per web broser (o per le altre piattaforme) è necessario aver installato NodeJS (quindi avere a disposizione il comando `npm`) e il CLI di Ionic

```
npm install -g @ionic/cli
```

a questo punto è possibile compilare l'applicazione tramite il seguente comando (l'opzione `browser` andrà sostiuita a seconda della piattaforma target desiderata):

```
ionic build --prod browser
```

La compilazione con l'opzione `browser` produce all'interno della directory `dist` l'applicazione finale da caricare sul server e da server tramite Apache HTTPD. Nello specifico, il contenuto di tale directory va caricata nella directory del server servita da Apache HTTPD (si assume `/var/www/html`) per questa applicazione. Va creato il Virtual Host (creazione del file `/etc/apache2/sites-available/000-default.conf`) 

```
 <VirtualHost *:80>
        ServerName www.baldoutdoor.it
        ServerAlias baldoutdoor.it
        ServerAdmin webmaster@baldoudoor.it

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        Redirect / https://baldoutdoor.it
</VirtualHost>

<VirtualHost *:443>
        ServerName www.baldoutdoor.it
        ServerAlias baldoutdoor.it
        ServerAdmin webmaster@baldoudoor.it
        DocumentRoot /var/www/html

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        Protocols h2 http/1.1
        SSLCertificateFile /etc/apache2/ssl/star_baldoutdoor_it.crt
        SSLCertificateKeyFile /etc/apache2/ssl/star_baldoutdoor_it.key        
		    SSLCACertificateFile /etc/apache2/ssl/intermediate-baldoutdoor.crt
		
		    # Various rewrite rules.
        <IfModule mod_rewrite.c>
           RewriteEngine on
           # Pass all requests not referring directly to files in the filesystem to index.html.
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteCond %{REQUEST_URI} !=/favicon.ico
           RewriteRule /map index.html [L]
		       RewriteRule /home index.html [L]
       </IfModule>
</VirtualHost>
```

Si noti che sia assume la presenza dei certificati SLL nella directory `/etc/apache2/ssl/`.


Infine, il Virtual Host viene attivato tramite il comando:

```
sudo a2ensite 000-default.conf
```

