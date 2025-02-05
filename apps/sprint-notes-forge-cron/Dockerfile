FROM docker.io/node:lts-alpine

WORKDIR /app

RUN addgroup --system sprint-notes-forge-cron && \
    adduser --system -G sprint-notes-forge-cron sprint-notes-forge-cron

COPY dist .
COPY crontab ./crontab
RUN chown -R sprint-notes-forge-cron:sprint-notes-forge-cron .

CMD [ "/usr/sbin/crond", "-f", "-l", "0", "-c", "/app/crontab", "-L", "/var/log/cron.log" ]