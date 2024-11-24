import * as aws from "@pulumi/aws";
import {
  createBucketPrivado,
  createBucketPublico,
  createBucketWeb,
  createRole,
  crearOsngPolitica,
  createLambdaRole,
  createApiGatewayRole,
  creatApiRest
} from "./labs";
import * as pulumi from "@pulumi/pulumi";

export class RecursosLabs {
  constructor() { }

  public createBucketPrivado(
    nombre: string,
    carpetas?: string[],
    tags?: aws.Tags
  ): aws.s3.Bucket {
    return createBucketPrivado(nombre, carpetas, tags);
  }

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
  public createRole(
    nombre: string,
    descripcion: string,
    servicio: string,
    politicasArn: pulumi.Input<string>[] = [],
    tags?: aws.Tags
  ): aws.iam.Role {
    return createRole(nombre, descripcion, servicio, politicasArn, tags);
  }
  public createLambdaRole(
    nombre: string,
    descripcion: string,
    politicasArn: pulumi.Input<string>[] = [],
    tags?: aws.Tags
  ): aws.iam.Role {
    return createLambdaRole(nombre, descripcion, politicasArn, tags);
  }
  public createApiGatewayRole(
    nombre: string,
    descripcion: string,
    tags?: aws.Tags
  ): aws.iam.Role {
    return createApiGatewayRole(nombre, descripcion, tags);
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
  public crearApiRes(arg: { nombre: string, descripcion: string, etiquetas: aws.Tags }) {
    return new creatApiRest(arg)

  }
}
