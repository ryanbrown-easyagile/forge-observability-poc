FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ARG YARN_VERSION=4.5.3

WORKDIR /app

RUN addgroup --system sprint-notes-remote && \
    adduser --system -G sprint-notes-remote sprint-notes-remote

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY dist/package.json .
RUN chown -R sprint-notes-remote:sprint-notes-remote .
# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --omit=dev -f install

COPY dist .
RUN chown -R sprint-notes-remote:sprint-notes-remote .

CMD [ "node", "main.js" ]
