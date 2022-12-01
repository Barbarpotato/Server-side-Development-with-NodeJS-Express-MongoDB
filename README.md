# Server-side-Development-with-NodeJS-Express-MongoDB
The Course Base from the Node.Js, Examine NodeJS and NodeJS modules: Express for building web servers. On the database side, we review basic CRUD operations, NoSQL databases, in particular MongoDB and Mongoose for accessing MongoDB from NodeJS.

# Set up the module.
Before we build the express application skeleton, we need to install some package that support us
to build express generator application.<br>
<br>First install these packages to the global variable if we are not yet installed in our device:
<br> <stong><em>npm install express-generator@Version -g</em></strong> <br>
You can visit the link Source in : 
<a href="https://expressjs.com/en/starter/generator.html">https://expressjs.com/en/starter/generator.html</a>
<br><br>
then, we ready to build up our skeleton application developed by express:<br>
```
express <'Application Name'>
```

# Set up the open ssl for using the https protocol simulation
<a href="https://www.stechies.com/amp/installing-openssl-windows-10-11/">You can click this to set up the installation of OPENSSL</a>
<p>if have some problem issue with that, open your terminal and typing this: set OPENSSL_CONF=<"PATH to openssl.cnf"></p>
<p>to Generate private key, certificate, etc you can type this:</p>
openssl genrsa 1024 > private.key<br>
openssl req -new -key private.key -out cert.csr<br>
openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem

