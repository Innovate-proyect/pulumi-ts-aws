import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
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
export declare class creatApiRest {
    private readonly api;
    private readonly hashApi;
    private readonly tag;
    constructor(arg: {
        nombre: string;
        descripcion: string;
        etiquetas: aws.Tags;
    });
    createMethod({ nombre, metodo, fnLambda }: ApiMethodConfig): ApiResourceResponse;
    Deployment(stageName: string, destinationArn: pulumi.Input<string>, resources: ApiResourceResponse[]): pulumi.Output<aws.apigateway.Stage>;
    getResourceUrl(stage: pulumi.Output<aws.apigateway.Stage>, resource: ApiResourceResponse): pulumi.Output<string>;
}
export {};
