
FROM nginx:stable-alpine

RUN addgroup --system sprint-notes-ui && \
    adduser --system -G sprint-notes-ui sprint-notes-ui

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY dist ./
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# RUN sed -i '10i \\ttry_files $uri $uri/ /index.html;' /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]