FROM ngix:alphine 
COPY . /usr/share/ngix/html
EXPOSE 80