import * as aws from "@pulumi/aws";
export declare function createApiGatewayRole(nombre: string, descripcion: string, tags?: aws.Tags): import("@pulumi/aws/iam/role").Role;
