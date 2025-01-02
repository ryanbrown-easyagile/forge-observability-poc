FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3333
ARG YARN_VERSION=4.5.3

WORKDIR /app

RUN addgroup --system sprint-notes-connect && \
    adduser --system -G sprint-notes-connect sprint-notes-connect

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY dist/apps/sprint-notes-connect/package.json .
RUN chown -R sprint-notes-connect:sprint-notes-connect .
# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --omit=dev -f install

COPY dist/apps/sprint-notes-connect .
RUN chown -R sprint-notes-connect:sprint-notes-connect .

CMD [ "node", "main.js" ]
