FROM nginx:latest

#Copying confing file
COPY ./nginx.conf /etc/nginx/nginx.conf

#Copying .htpasswd file that is created in runtime
COPY ./.htpasswd /etc/nginx/.htpasswd

#Copying html file(s)
COPY ./site/*.html /usr/share/nginx/html/index.html