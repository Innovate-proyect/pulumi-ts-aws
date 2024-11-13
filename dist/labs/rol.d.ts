import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
export declare function createRole(nombre: string, servicio: string, descripcion: string, politicasArn?: pulumi.Input<string>[], tags?: aws.Tags): import("@pulumi/aws/iam/role").Role;
