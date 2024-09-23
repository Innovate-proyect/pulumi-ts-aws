# Librería para Pulumi AWS

Esta librería facilita la creación y gestión de recursos en AWS utilizando Pulumi. Con esta herramienta, puedes definir la infraestructura de AWS de forma sencilla y eficiente.

## Instalación

1. Primero, [inicializa](https://www.pulumi.com/docs/clouds/aws/get-started/create-project/) un nuevo proyecto de Pulumi utilizando el siguiente comando:

   ```bash
   pulumi new aws-typescript
   ```

   Sigue las instrucciones para configurar tu proyecto.

2. Luego, instala la librería con el siguiente comando:

   ```bash
   npm install pulumi-ts-aws
   ```

## Uso

### Creación de Recursos

```typescript
// Importar el módulo
import { ServiciosAWS } from "pulumi-ts-aws";

const aws = new ServiciosAWS();

const capa = sls.crearCapa({
  ruta: "python/sls_utilidades_lambda",
  compatibleRuntimes: ["python3.12"],
  descripcion: "Librerias instaladas: [aws-lambda-powertools==2.39.1, pytz==2024.1](jmespath-1.0.1, typing_extensions-4.12.2)"
})

sls.crearFuncion({
  codigoFuente: {
    ruta: "funcion/main.py"
  },
  handler: "main.lambda_handler",
  descripcion: "lambda creada con libreria para serverles desde pulumi",
  roleArn: "arn:aws:iam::00000000000:role/osng_iamlambda-d8f5252",
  nombreGrupoLog: GRUPO_LOG,
  runtime: "python3.12",
  etiquetas: TAGS
})

sls.crearFuncion({
  codigoFuente: {
    ruta: "slsAcortadorUrl/main.py"
  },
  handler: "main.lambda_handler",
  descripcion: "Lambda para acortar links en un array",
  roleArn: "arn:aws:iam::00000000000:role/osng_iamlambda-d8f5252",
  nombreGrupoLog: GRUPO_LOG,
  runtime: "python3.12",
  tiempoEjecucion: 10,
  capas: [
    capa.arn
    "arn:aws:iam::00000000000:capa/capa_python-d8f5252"
  ],
  etiquetas: TAGS,
  variablesEntorno: {
    LOG_GROUP_NAME: GRUPO_LOG,
    LOG_STREAM_NAME: "fnAcortadorUrl_stream",
    POWERTOOLS_LOG_LEVEL: "INFO",
    POWERTOOLS_SERVICE_NAME: "loggingg",
  },
  dependencias: [capa]
})

sls.crearFuncion({
  codigoFuente: {
    ruta: "slsFiltrado/main.py"
  },
  handler: "main.lambda_handler",
  descripcion: "Lambda para filtrar reguistros",
  roleArn: "arn:aws:iam::00000000000:role/osng_iamlambdas3recldbcomu-d11fe95",
  nombreGrupoLog: GRUPO_LOG,
  runtime: "python3.12",
  tiempoEjecucion: 10,
  capas: [
    capa.arn
  ],
  etiquetas: TAGS,
  eventos: [
    {
      tipo: "s3",
      parametros: {
        nombreBucket: "dev-osng-informacion-reclamos",
        eventos: [
          "s3:ObjectCreated:Put"
        ],
        prefigo: "dataset_osng_reclamos",
        extencion: ".csv"

      }
    }]
})
```
