# Vectortowns

<a href="https://vectortowns.com"><img src="http://linu.com.br/vectortowns/img/logo-small.png" align="left" hspace="10" vspace="6"></a>

<br>
**Vectortowns** is a text-based online RPG set in a wrecked, extreme, and unscrupulous future where all biological and mechatronic beings (both playable) live in endless underground tunnels. Explore thousands of rooms, find random items, and get unique cards!
<br><br>

### Development Details
- NodeJS
- Express
- EJS
- Redis
- Materialize (css)
- JQuery
- Java (AI project)
- MySQL
- Nginx

### This repository contains:
- Source code of the game's web part (the main part);
- Static content;
- Database scripts.

### This repository does not contain:
- Property file (with passwords, ports and urls);
- SSL certificate and key;
- Code of artificial intelligence of the game.




# Configure and Install

This session will list the steps required to configure the project on your machine. You will need root privileges to complete the procedure. For now there is only the installation procedure on Linux machines. Fork it and contribute procedures to other platforms.

Obviously you only need to perform the steps below if you want to contribute with the project or create a parallel game server. If you just want to play it, go to [vectortowns.com](https://vectortowns.com). The game is online and free :)

### Read before continuing

In this tutorial we are working with a specific directory structure. The commands below show how to set up a similar one. Change the group and user name to your settings (here I am using a group and a user named ubuntu).

```
cd /var/log/
sudo mkdir nodejs
sudo chown ubuntu:ubuntu nodejs/
cd nodejs/
mkdir nodejs-project
cd /opt/
sudo mkdir repositories
sudo chown ubuntu:ubuntu repositories/
cd repositories
mkdir -p github/vectortowns/
cd github/vectortowns/
```

This last directory is the main project directory.

### Installing GIT and cloning the project

Some commands below were performed for the owner of the GIT repository. Change them to your user.

```
cd /opt/repositories/github/vectortowns/
sudo apt-get install git
git config --global user.name "vectortowns"
git config --global user.email dev@vectortowns.com
git clone https://github.com/vectortowns/vectortowns.git
```

The next commands will configure the directory to save the auto-signed certificate and the properties.js file adjusted with your data. Read the contents of properties-template.js for more details.

```
cd /opt/repositories/github/vectortowns/
mkdir vectortowns-secret
cd vectortowns-secret
cp ../vectortowns/properties-template.js .
cp properties-template.js properties.js
```

Now let's create the auto-signed key.

```
cd /opt/repositories/github/vectortowns/vectortowns-secret/
openssl genrsa -out vectortowns-key.pem 2048
openssl req -new -sha256 -key vectortowns-key.pem -out vectortowns-csr.pem
openssl x509 -req -in vectortowns-csr.pem -signkey vectortowns-key.pem -out vectortowns-cert.pem
```

### Installing Redis

Let's use Redis to save nodejs sections.

```
sudo apt-get install redis-server
redis-server &
```

By default, Redis runs at 127.0.0.1:6379. In this tutorial we will keep it that way. Change your settings to /opt/repositories/github/vectortowns/vectortowns-secret/properties.js if necessary.


### Installing MySQL

This project uses the MySQL database. You are free to user any bank (and I do not even need to say this, okay). If you choose another, you will need to adjust the database configuration script.

```
sudo apt-get update
sudo apt-get install mysql-server
[Set a very good password for root]
sudo mysql_secure_installation
[Please reply as follows: N Y Y Y Y]
mysql -u root -p
create database vectortowns CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';
create user 'vtuser'@'localhost' identified by '123andGo';
grant all on vectortowns.* to 'vtuser'@'localhost' identified by '123andGo';
exit
```

Okay, the bank was created. Now let's apply the project database script.

```
cd /opt/repositories/github/vectortowns/vectortowns/
./run_create_db.sh
[Enter the vtuser password]
```

Okay. If you want to take a test, do the following:

```
mysql -u vtuser -p
use vectortowns;
select * from profile;
exit
```

### Installing NodeJS

Let's install the NodeJS, the npm and configure the project (download the dependencies).

```
cd /opt/repositories/github/vectortowns/vectortowns/
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install npm
npm install
```

Caution: If there is an error in the installation of npm, check that it has not been installed with nodejs. If so, you do not need to install it. If an error occurs while installing the project packages related to node-gyp, execute the following commands:

```
sudo apt-get install node-gyp
```

At this point we could already execute the project on NodeJS, however, since the publication of static content and HTTPS is performed by Nginx, we will leave it to start everything at the end of this tutorial.

### Installing Nginx

Finally, let's install Nginx. Through it we will make the SSL proxy for NodeJS and publish all the static content.

```
cd /opt/repositories/github/vectortowns/vectortowns/
sudo apt-get install nginx
sudo chown -R www-data:www-data static/
sudo chmod 755 static/
sudo cp doc/nginx/vectortowns.com /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vectortowns.com /etc/nginx/sites-enabled/vectortowns.com
sudo service nginx start
```

### Run the project

Now let's run and test the project.

```
cd /opt/repositories/github/vectortowns/vectortowns/
./run_DEVELOPMENT_server.sh
```

Go to [localhost](https://127.0.0.1) and be happy!




# Utility

### Sublime Text Commands
```
Ctrl + Shift + P : Choose file type
Ctrl + K, Ctrl + U : Converts to Uppercase (the selected text)
Ctrl + K, Ctrl + L : Converts to Lowercase (the selected text)
```

### Supporting Documentation

* [NodeJS with EJS](https://scotch.io/tutorials/use-ejs-to-template-your-node-application)
* [Types of Software Testing](http://www.targettrust.com.br/blog/desenvolvimento/testes/os-13-principais-tipos-de-testes-de-software/)
* [Node.js v6.9.1 Documentation](https://nodejs.org/dist/latest-v6.x/docs/api/)
* [Node.js environment config file](http://stackoverflow.com/questions/8332333/node-js-setting-up-environment-specific-configs-to-be-used-with-everyauth)
* [Const, let or var in JavaScript](https://medium.com/javascript-scene/javascript-es6-var-let-or-const-ba58b8dcde75#.qhrnn0bcj)
* [NodeJS Logger](http://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/)
* [Winston](https://www.npmjs.com/package/winston)
* [Moment in NodeJS](http://momentjs.com/timezone/docs/)
* [35 tips of catch errors in NodeJS](http://goldbergyoni.com/checklist-best-practices-of-node-js-error-handling/)
* [Images of Materialize offline](http://stackoverflow.com/questions/37270835/how-to-host-material-icons-offline)
* [Unit tests with Mocha and Chai](https://www.codementor.io/nodejs/tutorial/unit-testing-nodejs-tdd-mocha-sinon)
* [Regression tests with Selenium IDE](http://www.qualister.com.br/blog/introducao-ao-selenium-ide)
* [Configuring package.json tests](http://wbruno.com.br/nodejs/package-json-entendendo-os-scripts/)
* [GitHub of ChaiHTTP](https://github.com/chaijs/chai-http)
* [Example of integration tests with ChaiHTTP](https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai)
* [Online Image Editor](https://www.freeonlinephotoeditor.com/)
* [Oauth2 with Google](https://www.npmjs.com/package/passport-google-oauth2)
* [Redis Tutorial](https://codeforgeek.com/2016/06/node-js-redis-tutorial-installation-commands/)
* [Tips for Organizing URLs](https://moz.com/blog/15-seo-best-practices-for-structuring-urls)
* [Security Tips for Express](https://expressjs.com/en/advanced/best-practice-security.html)
* [REGEX online test](http://www.regexpal.com/)
* [OpenSSL with Nodejs and HTTPS](https://nodejs.org/api/tls.html)
* [Run sudo command without password](http://askubuntu.com/questions/159007/how-do-i-run-specific-sudo-commands-without-a-password)
* [Good practice of NodeJS applications](https://www.terlici.com/2014/08/25/best-practices-express-structure.html)
* [Table of Locales](https://docs.moodle.org/dev/Table_of_locales)
* [Object Oriented in Javascript](http://www.w3schools.com/js/js_object_prototypes.asp)
* [Good practices for RESTful](http://stackoverflow.com/questions/942951/rest-api-error-return-good-practices)
* [Meter password](https://css-tricks.com/password-strength-meter/)
* [Share javascript code with browser and nodejs](https://caolan.org/posts/writing_for_node_and_the_browser.html)
* [Online Image Compressor](http://compresspng.com/)
* [Hostgator ports](http://support.hostgator.com/articles/commonly-used-port-numbers)
