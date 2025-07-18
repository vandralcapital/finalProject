```
server {
    listen 443 ssl;
    server_name 10.91.41.16;

    ssl_certificate /etc/ssl/religare/religare.in.crt;
    ssl_certificate_key /etc/ssl/religare/religare.in.key;

    root /opt/ER_Linux/frontend/build;
    index index.html;

    # Serve static files directly
    location /static/ {
        alias /opt/ER_Linux/frontend/build/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Serve other assets (fonts, images, etc.)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|ttf|svg|eot|otf|json)$ {
        root /opt/ER_Linux/frontend/build;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Proxy EVERYTHING else to backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name 10.91.41.16;
    return 301 https://$host$request_uri;
}
```
