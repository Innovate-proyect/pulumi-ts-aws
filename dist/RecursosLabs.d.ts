import * as aws from "@pulumi/aws";
import { creatApiRest } from "./labs";
import * as pulumi from "@pulumi/pulumi";
export declare class RecursosLabs {
    constructor();
    createBucketPrivado(nombre: string, carpetas?: string[], tags?: aws.Tags): aws.s3.Bucket;
    createBucketPublico(nombre: string, carpetas?: string[], tags?: aws.Tags): aws.s3.Bucket;
    createBucketWeb(nombre: string, tags?: aws.Tags): aws.s3.Bucket;
    createRole(nombre: string, descripcion: string, servicio: string, politicasArn?: pulumi.Input<string>[], tags?: aws.Tags): aws.iam.Role;
    createLambdaRole(nombre: string, descripcion: string, politicasArn?: pulumi.Input<string>[], tags?: aws.Tags): aws.iam.Role;
    createApiGatewayRole(nombre: string, descripcion: string, tags?: aws.Tags): aws.iam.Role;
    crearOsngPolitica(nombre: string, descripcion: string, acciones: string[], recursos: pulumi.Output<string>[] | string[], dependencias?: pulumi.Input<pulumi.Input<pulumi.Resource>[]>, tags?: aws.Tags): aws.iam.Policy;
    crearApiRes(arg: {
        nombre: string;
        descripcion: string;
        etiquetas: aws.Tags;
    }): creatApiRest;
}
