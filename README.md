# Forge Observability Proof of Concept

This codebase includes the experiments made to investigate how the 3 Pillars of Observability (Metrics, Logs, Traces) can work on Atlassian Forge.  The experiment consists of a Connect and Forge version of the same application, "Sprint Notes", a simple Jira application that allows a user to save one or more notes against a sprint.

## Infrastructure
Importantly, there are a lot (a lot) of containers included in this experiment:

### Application Containers
* `connect-on-forge`: Used to deploy and maintain the Connect on Forge version of the app
* `connect`: Used to host the Atlassian Connect Express JS version of the app
* `db`: The Postgres Datastore used in the Connect and Remote version of the app
* `forge-app`:  Used to deploy and maintain the Forge Remote and Forge Native versions of the app
* `forge-cron`: Hosts the nodeJS pipeline to pull metrics and logs from Atlassian APIs.  Executed on schedule via a crontab.
* `ngrok-connect`: Creates a ngrok tunnel to the `connect` container.
* `ngrok-otel`: Creates a ngrok tunnel to the `otelcol` container
* `ngrok-remote`: Creates a ngrok tunnel to the `remote` container
* `remote`: Hosts a NodeJS Express API used as a Remote in Forge Remote version of app.
* `web`: Hosts the UI used in Connect and Connect on Forge version of app.

### Observability Containers
These are pull from the [OpenTelemetry demo](https://github.com/open-telemetry/opentelemetry-demo/tree/main) container setup.
* `data-prepper`
* `grafana`
* `jaeger-agent`
* `jaeger`
* `opensearch-dashboards`
* `opensearch-data1`
* `opensearch-data2`
* `opensearch-node1`
* `opensearch-node2`
* `otelcol`
* `prometheus`
* `prometheus_data`

## Getting Started
### Setup credentials
#### Forge
To do forge deployments, create copies of the following files, fill in the required details and save to their non-example paths:
* config/forge/.env.example => config/forge/.env
* config/forge/.cron.env.example => config/forge/.cron.env

#### NGrok
To have you local connect and OpenTelemetry collector exposed to the internet, we need to setup NGrok tunnels.  To do this, copy the `config/ngrok/ngrok.sample.yml` file to create the following files, each with their own domain:
* config/ngrok/ngrok.connect.yml 
* config/ngrok/ngrok.otel.yml
* config/ngrok/ngrok.remote.yml

### Build all
Run the following to build all projects:
```
yarn build:all
```
