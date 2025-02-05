FROM docker.io/node:lts-alpine

ARG YARN_VERSION=4.5.3

WORKDIR /app

RUN addgroup --system sprint-notes-connect-on-forge && \
    adduser --system -G sprint-notes-connect-on-forge sprint-notes-connect-on-forge

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN yarn global add @forge/cli
RUN forge settings set usage-analytics false

RUN chown -R sprint-notes-connect-on-forge:sprint-notes-connect-on-forge .

CMD [ "forge", "whoami" ]
