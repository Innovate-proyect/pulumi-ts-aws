import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PREFIJO } from "../env/variables";
import { stringTo8Char } from "../models/utils";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";

interface ApiMethodConfig {
  nombre: string;
  metodo: HttpMethod;
  fnLambda: aws.lambda.Function;
}

interface ApiResourceResponse {
  resource: pulumi.Output<aws.apigateway.Resource>;
  integration200: pulumi.Output<aws.apigateway.IntegrationResponse>;
  integrationMock200: pulumi.Output<aws.apigateway.IntegrationResponse>;
}

interface ResourceContext {
  hashApi: string;
  hashLambda: string;
  nombre: string;
  api: aws.apigateway.RestApi;
  resource: aws.apigateway.Resource;
  mainMethod: aws.apigateway.Method;
  optionsMethod: aws.apigateway.Method;
  methodResponse?: aws.apigateway.MethodResponse;
  mockMethodResponse?: aws.apigateway.MethodResponse;
}

interface DeploymentContext {
  hashApi: string;
  api: aws.apigateway.RestApi;
  deployment: aws.apigateway.Deployment;
  stage?: aws.apigateway.Stage;
}

class DeploymentBuilder {
  private context: DeploymentContext;

  constructor(
    private readonly config: {
      api: aws.apigateway.RestApi;
      hashApi: string;
    }
  ) {
    this.context = {
      ...config,
      deployment: null!,
    };
  }

  createDeployment(resources: ApiResourceResponse[]): DeploymentBuilder {
    this.context.deployment = new aws.apigateway.Deployment(
      `${PREFIJO}_${this.context.hashApi}-despliegue`,
      {
        restApi: this.context.api.id,
      },
      {
        dependsOn: resources.flatMap(resource => [
          resource.resource,
          resource.integration200,
          resource.integrationMock200,
        ]),
      }
    );
    return this;
  }

  createStage(stageName: string, destinationArn: pulumi.Input<string>, tag: aws.Tags): DeploymentBuilder {
    this.context.stage = new aws.apigateway.Stage(
      `${PREFIJO}_${this.context.hashApi}-stage-${stageName}`,
      {
        deployment: this.context.deployment.id,
        restApi: this.context.api.id,
        stageName: stageName,
        accessLogSettings: {
          destinationArn: destinationArn,
          format: JSON.stringify({
            requestId: "$context.requestId",
            extendedRequestId: "$context.extendedRequestId",
            ip: "$context.identity.sourceIp",
            caller: "$context.identity.caller",
            user: "$context.identity.user",
            requestTime: "$context.requestTime",
            httpMethod: "$context.httpMethod",
            resourcePath: "$context.resourcePath",
            status: "$context.status",
            protocol: "$context.protocol",
            responseLength: "$context.responseLength",
          }),
        }, tags: tag
      },
      { dependsOn: [this.context.deployment] }
    );
    return this;
  }

  getStage(): pulumi.Output<aws.apigateway.Stage> {
    return pulumi.output(this.context.stage!);
  }
}

class ResourceBuilder {
  private context: ResourceContext;
  constructor(
    private readonly config: {
      api: aws.apigateway.RestApi,
      hashApi: string,
      hashLambda: string,
      nombre: string,
    }
  ) {
    this.context = {
      ...config,
      resource: null!,
      mainMethod: null!,
      optionsMethod: null!,
    };
  }

  createResource(): ResourceBuilder {
    this.context.resource = new aws.apigateway.Resource(
      `${PREFIJO}_${this.context.hashApi}-${this.context.nombre}`,
      {
        restApi: this.context.api.id,
        parentId: this.context.api.rootResourceId,
        pathPart: this.context.nombre
      },
      { dependsOn: [this.context.api] }
    );
    return this;
  }

  createMainMethod(metodo: string): ResourceBuilder {
    this.context.mainMethod = new aws.apigateway.Method(
      `${PREFIJO}_${this.context.hashApi}-${this.context.nombre}-${metodo}`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: metodo,
        authorization: "NONE",
        apiKeyRequired: false,
      },
      { dependsOn: [this.context.resource] }
    );
    return this;
  }

  createLambdaIntegration(fnLambda: aws.lambda.Function): ResourceBuilder {
    new aws.apigateway.Integration(
      `${PREFIJO}_${this.context.hashApi}-integration-${this.context.hashLambda}`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.mainMethod!.httpMethod,
        type: "AWS",
        uri: fnLambda.invokeArn,
        integrationHttpMethod: "POST",
        passthroughBehavior: "WHEN_NO_TEMPLATES",
        requestParameters: {
          "integration.request.header.Access-Control-Allow-Origin": "'*'",
        },
        requestTemplates: {
          "application/json": `
          {
            "body": $input.json('$'),
            "method": "$context.httpMethod",
            "path": "$context.resourcePath",
            "queryStringParameters": {
              #foreach($param in $input.params().querystring.keySet())
              "$param": "$util.escapeJavaScript($input.params().querystring.get($param))"
              #if($foreach.hasNext),#end
              #end
            },
            "pathParameters": {
              #foreach($param in $input.params().path.keySet())
              "$param": "$util.escapeJavaScript($input.params().path.get($param))"
              #if($foreach.hasNext),#end
              #end
            },
            "requestContext": {
              #foreach($header in $input.params().header.keySet())
              "$header": "$util.escapeJavaScript($input.params().header.get($header))"
              #if($foreach.hasNext),#end
              #end
            }
          }`
        }
      },
      { dependsOn: [fnLambda] }
    );
    return this;
  }

  createMethodResponse(metodo: string): ResourceBuilder {
    this.context.methodResponse = new aws.apigateway.MethodResponse(
      `${PREFIJO}_${this.context.hashApi}-${this.context.nombre}-${metodo}200`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.mainMethod!.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
      { dependsOn: [this.context.mainMethod] }
    );
    return this;
  }

  createIntegrationResponse(metodo: string): pulumi.Output<aws.apigateway.IntegrationResponse> {
    return pulumi.output(new aws.apigateway.IntegrationResponse(
      `${PREFIJO}_${this.context.hashApi}-integration-${this.context.nombre}-${metodo}200`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.mainMethod!.httpMethod,
        statusCode: this.context.methodResponse!.statusCode,
        responseTemplates: {
          "application/json": `
          #set($inputRoot = $input.path('$'))
          {
            "body": $inputRoot.body,
            "meta": {
              "timestamp": "$context.requestTime",
              "path": "$context.resourcePath",
              "statusCode": $inputRoot.statusCode,
              "requestId": "$context.requestId"
            }
          }`
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": "'*'"
        },
      }
    ));
  }

  createOptionsMethod(): ResourceBuilder {
    this.context.optionsMethod = new aws.apigateway.Method(
      `${PREFIJO}_${this.context.hashApi}-${this.context.nombre}-options`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: "OPTIONS",
        authorization: "NONE",
        apiKeyRequired: false,
      },
      { dependsOn: [this.context.resource] }
    );
    return this;
  }

  createMockIntegration(): ResourceBuilder {
    new aws.apigateway.Integration(
      `${PREFIJO}_mock-${this.context.hashApi}-${this.context.nombre}-options`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.optionsMethod!.httpMethod,
        type: "MOCK",
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      },
      { dependsOn: [this.context.resource] }
    );
    return this;
  }

  createMockMethodResponse(): ResourceBuilder {
    this.context.mockMethodResponse = new aws.apigateway.MethodResponse(
      `${PREFIJO}_mock-${this.context.hashApi}-${this.context.nombre}-options200`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.optionsMethod!.httpMethod,
        statusCode: "200",
        responseModels: {
          "application/json": "Empty",
        },
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
      { dependsOn: [this.context.optionsMethod] }
    );
    return this;
  }

  createMockIntegrationResponse(): pulumi.Output<aws.apigateway.IntegrationResponse> {
    return pulumi.output(new aws.apigateway.IntegrationResponse(
      `${PREFIJO}_mock-${this.context.hashApi}-resp-${this.context.nombre}-options200`,
      {
        restApi: this.context.api.id,
        resourceId: this.context.resource.id,
        httpMethod: this.context.optionsMethod!.httpMethod,
        statusCode: this.context.mockMethodResponse!.statusCode,
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE,HEAD'",
          "method.response.header.Access-Control-Allow-Origin": "'*'",
        },
      }
    ));
  }

  createLambdaPermission(fnLambda: aws.lambda.Function): ResourceBuilder {
    new aws.lambda.Permission(
      `${PREFIJO}_${this.context.nombre}-permiso-${this.context.hashLambda}`,
      {
        action: "lambda:InvokeFunction",
        function: fnLambda.name,
        principal: "apigateway.amazonaws.com",
        sourceArn: pulumi.interpolate`${this.context.api.executionArn}/*/${this.context.mainMethod!.httpMethod}/${this.context.resource.pathPart}`,
      }
    );
    return this;
  }

  getResource(): pulumi.Output<aws.apigateway.Resource> {
    return pulumi.output(this.context.resource);
  }
}

export class creatApiRest {
  private readonly api: aws.apigateway.RestApi;
  private readonly hashApi: pulumi.Output<string>;
  private readonly tag: aws.Tags

  constructor(arg: { nombre: string, descripcion: string, etiquetas: aws.Tags }) {
    this.api = new aws.apigateway.RestApi(`${PREFIJO}_api-${arg.nombre}`, {
      name: arg.nombre,
      description: arg.descripcion,
      tags: arg.etiquetas
    });
    this.tag = arg.etiquetas
    this.hashApi = this.api.arn.apply(stringTo8Char);
  }

  public createMethod({ nombre, metodo, fnLambda }: ApiMethodConfig): ApiResourceResponse {
    return pulumi.all([this.hashApi, fnLambda.arn]).apply(([hashApi, lambdaArn]) => {
      const builder = new ResourceBuilder({
        api: this.api,
        hashApi,
        hashLambda: stringTo8Char(lambdaArn),
        nombre
      });

      // Crear recursos principales
      builder
        .createResource()
        .createMainMethod(metodo)
        .createLambdaIntegration(fnLambda)
        .createMethodResponse(metodo);

      const integration200 = builder.createIntegrationResponse(metodo);

      // Crear recursos OPTIONS
      builder
        .createOptionsMethod()
        .createMockIntegration()
        .createMockMethodResponse();

      const integrationMock200 = builder.createMockIntegrationResponse();

      // Crear permisos
      builder.createLambdaPermission(fnLambda);

      return {
        resource: builder.getResource(),
        integration200,
        integrationMock200
      };
    });
  }

  public Deployment(
    stageName: string,
    destinationArn: pulumi.Input<string>,
    resources: ApiResourceResponse[]
  ): pulumi.Output<aws.apigateway.Stage> {
    return this.hashApi.apply(hashApi => {
      const deploymentBuilder = new DeploymentBuilder({
        api: this.api,
        hashApi,
      });

      deploymentBuilder
        .createDeployment(resources)
        .createStage(stageName, destinationArn, this.tag);

      return deploymentBuilder.getStage();
    });
  }

  public getResourceUrl(
    stage: pulumi.Output<aws.apigateway.Stage>,
    resource: ApiResourceResponse
  ): pulumi.Output<string> {
    return pulumi.all([stage, resource.resource]).apply(([stageVal, resourceVal]) =>
      pulumi.interpolate`${stageVal.invokeUrl}/${resourceVal.pathPart}`
    ).apply(url => url);
  }

}