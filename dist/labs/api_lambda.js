"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatApiRest = void 0;
const aws = __importStar(require("@pulumi/aws"));
const pulumi = __importStar(require("@pulumi/pulumi"));
const variables_1 = require("../env/variables");
const utils_1 = require("../models/utils");
class DeploymentBuilder {
    constructor(config) {
        this.config = config;
        this.context = Object.assign(Object.assign({}, config), { deployment: null });
    }
    createDeployment(resources) {
        this.context.deployment = new aws.apigateway.Deployment(`${variables_1.PREFIJO}_${this.context.hashApi}-despliegue`, {
            restApi: this.context.api.id,
        }, {
            dependsOn: resources.flatMap(resource => [
                resource.resource,
                resource.integration200,
                resource.integrationMock200,
            ]),
        });
        return this;
    }
    createStage(stageName, destinationArn, tag) {
        this.context.stage = new aws.apigateway.Stage(`${variables_1.PREFIJO}_${this.context.hashApi}-stage-${stageName}`, {
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
        }, { dependsOn: [this.context.deployment] });
        return this;
    }
    getStage() {
        return pulumi.output(this.context.stage);
    }
}
class ResourceBuilder {
    constructor(config) {
        this.config = config;
        this.context = Object.assign(Object.assign({}, config), { resource: null, mainMethod: null, optionsMethod: null });
    }
    createResource() {
        this.context.resource = new aws.apigateway.Resource(`${variables_1.PREFIJO}_${this.context.hashApi}-${this.context.nombre}`, {
            restApi: this.context.api.id,
            parentId: this.context.api.rootResourceId,
            pathPart: this.context.nombre
        }, { dependsOn: [this.context.api] });
        return this;
    }
    createMainMethod(metodo) {
        this.context.mainMethod = new aws.apigateway.Method(`${variables_1.PREFIJO}_${this.context.hashApi}-${this.context.nombre}-${metodo}`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: metodo,
            authorization: "NONE",
            apiKeyRequired: false,
        }, { dependsOn: [this.context.resource] });
        return this;
    }
    createLambdaIntegration(fnLambda) {
        new aws.apigateway.Integration(`${variables_1.PREFIJO}_${this.context.hashApi}-integration-${this.context.hashLambda}`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.mainMethod.httpMethod,
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
        }, { dependsOn: [fnLambda] });
        return this;
    }
    createMethodResponse(metodo) {
        this.context.methodResponse = new aws.apigateway.MethodResponse(`${variables_1.PREFIJO}_${this.context.hashApi}-${this.context.nombre}-${metodo}200`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.mainMethod.httpMethod,
            statusCode: "200",
            responseModels: {
                "application/json": "Empty",
            },
            responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": true,
            },
        }, { dependsOn: [this.context.mainMethod] });
        return this;
    }
    createIntegrationResponse(metodo) {
        return pulumi.output(new aws.apigateway.IntegrationResponse(`${variables_1.PREFIJO}_${this.context.hashApi}-integration-${this.context.nombre}-${metodo}200`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.mainMethod.httpMethod,
            statusCode: this.context.methodResponse.statusCode,
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
        }));
    }
    createOptionsMethod() {
        this.context.optionsMethod = new aws.apigateway.Method(`${variables_1.PREFIJO}_${this.context.hashApi}-${this.context.nombre}-options`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: "OPTIONS",
            authorization: "NONE",
            apiKeyRequired: false,
        }, { dependsOn: [this.context.resource] });
        return this;
    }
    createMockIntegration() {
        new aws.apigateway.Integration(`${variables_1.PREFIJO}_mock-${this.context.hashApi}-${this.context.nombre}-options`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.optionsMethod.httpMethod,
            type: "MOCK",
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }, { dependsOn: [this.context.resource] });
        return this;
    }
    createMockMethodResponse() {
        this.context.mockMethodResponse = new aws.apigateway.MethodResponse(`${variables_1.PREFIJO}_mock-${this.context.hashApi}-${this.context.nombre}-options200`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.optionsMethod.httpMethod,
            statusCode: "200",
            responseModels: {
                "application/json": "Empty",
            },
            responseParameters: {
                "method.response.header.Access-Control-Allow-Headers": true,
                "method.response.header.Access-Control-Allow-Methods": true,
                "method.response.header.Access-Control-Allow-Origin": true,
            },
        }, { dependsOn: [this.context.optionsMethod] });
        return this;
    }
    createMockIntegrationResponse() {
        return pulumi.output(new aws.apigateway.IntegrationResponse(`${variables_1.PREFIJO}_mock-${this.context.hashApi}-resp-${this.context.nombre}-options200`, {
            restApi: this.context.api.id,
            resourceId: this.context.resource.id,
            httpMethod: this.context.optionsMethod.httpMethod,
            statusCode: this.context.mockMethodResponse.statusCode,
            responseParameters: {
                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST,GET,PUT,DELETE,HEAD'",
                "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
        }));
    }
    createLambdaPermission(fnLambda) {
        new aws.lambda.Permission(`${variables_1.PREF_LAMBPERMISSION}_${this.context.nombre}-permiso-${this.context.hashLambda}`, {
            action: "lambda:InvokeFunction",
            function: fnLambda.name,
            principal: "apigateway.amazonaws.com",
            sourceArn: pulumi.interpolate `${this.context.api.executionArn}/*/${this.context.mainMethod.httpMethod}/${this.context.resource.pathPart}`,
        });
        return this;
    }
    getResource() {
        return pulumi.output(this.context.resource);
    }
}
class creatApiRest {
    constructor(arg) {
        this.api = new aws.apigateway.RestApi(`${variables_1.PREFIJO}_api-${arg.nombre}`, {
            name: arg.nombre,
            description: arg.descripcion,
            tags: arg.etiquetas
        });
        this.tag = arg.etiquetas;
        this.hashApi = this.api.arn.apply(utils_1.stringTo8Char);
    }
    createMethod({ nombre, metodo, fnLambda }) {
        return pulumi.all([this.hashApi, fnLambda.arn]).apply(([hashApi, lambdaArn]) => {
            const builder = new ResourceBuilder({
                api: this.api,
                hashApi,
                hashLambda: (0, utils_1.stringTo8Char)(lambdaArn),
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
    Deployment(stageName, destinationArn, resources) {
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
    getResourceUrl(stage, resource) {
        return pulumi.all([stage, resource.resource]).apply(([stageVal, resourceVal]) => pulumi.interpolate `${stageVal.invokeUrl}/${resourceVal.pathPart}`).apply(url => url);
    }
}
exports.creatApiRest = creatApiRest;
