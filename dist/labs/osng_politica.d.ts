import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
export declare function crearOsngPolitica(nombre: string, descripcion: string, acciones: string[], recursos: pulumi.Output<string>[] | string[], dependencias?: pulumi.Input<pulumi.Input<pulumi.Resource>[]>, tags?: aws.Tags): import("@pulumi/aws/iam/policy").Policy;
