import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
export declare class RecursosLabs {
    constructor();
    createBucketPublico(nombre: string, carpetas?: string[], tags?: aws.Tags): aws.s3.Bucket;
    createBucketWeb(nombre: string, tags?: aws.Tags): aws.s3.Bucket;
    createLambdaRole(nombre: string, descripcion: string, politicasArn?: pulumi.Input<string>[], tags?: aws.Tags): aws.iam.Role;
    crearOsngPolitica(nombre: string, descripcion: string, acciones: string[], recursos: pulumi.Output<string>[] | string[], dependencias?: pulumi.Input<pulumi.Input<pulumi.Resource>[]>, tags?: aws.Tags): aws.iam.Policy;
}
