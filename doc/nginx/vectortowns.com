server {
	listen 80;
	server_name 127.0.0.1;

	root /opt/repositories/github/vectortowns/vectortowns/static/;
	index index.html index.htm;

	#
	# Wide-open CORS config for nginx
	#
	location /static/ {
	     if ($request_method = 'OPTIONS') {
	        add_header 'Access-Control-Allow-Origin' '*';
	        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
	        #
	        # Custom headers and headers various browsers *should* be OK with but aren't
	        #
	        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
	        #
	        # Tell client that this pre-flight info is valid for 20 days
	        #
	        add_header 'Access-Control-Max-Age' 1728000;
	        add_header 'Content-Type' 'text/plain charset=UTF-8';
	        add_header 'Content-Length' 0;
	        return 204;
	     }
	     if ($request_method = 'POST') {
	        add_header 'Access-Control-Allow-Origin' '*';
	        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
	        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
	     }
	     if ($request_method = 'GET') {
	        add_header 'Access-Control-Allow-Origin' '*';
	        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
	        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
	     }

	     alias /opt/repositories/github/vectortowns/vectortowns/static/;
	}

	error_page 404 =200 https://127.0.0.1/not-found;
	error_page 500 502 503 504 =200 https://127.0.0.1/error;

	#location / {
        #        rewrite ^/ https://127.0.0.1 permanent;
        #}

}

server {
	listen 443 ssl;

        ssl_certificate /opt/repositories/github/vectortowns/vectortowns-secret/vectortowns-cert.pem;
        ssl_certificate_key /opt/repositories/github/vectortowns/vectortowns-secret/vectortowns-key.pem;
        ssl_protocols        SSLv3 TLSv1;
        ssl_ciphers HIGH:!aNULL:!MD5;

	server_name 127.0.0.1:443;

	location / {
        	proxy_pass  http://127.0.0.1:8443;
	        proxy_redirect off;
	        proxy_set_header Host $host ;
	        proxy_set_header X-Real-IP $remote_addr ;
	        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for ;
	        proxy_set_header X-Forwarded-Proto https;
        }
}
