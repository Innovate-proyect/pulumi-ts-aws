import * as aws from "@pulumi/aws";
import {
  createBucketPublico,
  createBucketWeb,
  createLambdaRole,
  crearOsngPolitica,
} from "./labs";
import * as pulumi from "@pulumi/pulumi";

export class RecursosLabs {
  constructor() {}

  public createBucketPublico(
    nombre: string,
    carpetas?: string[],
    tags?: aws.Tags
  ): aws.s3.Bucket {
    return createBucketPublico(nombre, carpetas, tags);
  }
  public createBucketWeb(nombre: string, tags?: aws.Tags): aws.s3.Bucket {
    return createBucketWeb(nombre, tags);
  }
  public createLambdaRole(
    nombre: string,
    descripcion: string,
    politicasArn: pulumi.Input<string>[] = [],
    tags?: aws.Tags
  ): aws.iam.Role {
    return createLambdaRole(nombre, descripcion, politicasArn, tags);
  }
  public crearOsngPolitica(
    nombre: string,
    descripcion: string,
    acciones: string[],
    recursos: pulumi.Output<string>[] | string[],
    dependencias?: pulumi.Input<pulumi.Input<pulumi.Resource>[]>,
    tags?: aws.Tags
  ): aws.iam.Policy {
    return crearOsngPolitica(
      nombre,
      descripcion,
      acciones,
      recursos,
      dependencias,
      tags
    );
  }
}
