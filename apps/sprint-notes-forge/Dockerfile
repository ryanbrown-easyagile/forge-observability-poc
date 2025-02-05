FROM docker.io/node:lts-alpine

ARG YARN_VERSION=4.5.3

WORKDIR /app

RUN addgroup --system sprint-notes-forge && \
    adduser --system -G sprint-notes-forge sprint-notes-forge

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN yarn global add @forge/cli nx@latest
RUN forge settings set usage-analytics false

RUN chown -R sprint-notes-forge:sprint-notes-forge .

CMD [ "forge", "whoami" ]
