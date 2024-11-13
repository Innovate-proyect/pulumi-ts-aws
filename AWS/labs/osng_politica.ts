import * as aws from "@pulumi/aws";
import { PREFIJO } from "../env/variables";
import * as pulumi from "@pulumi/pulumi";

export function crearOsngPolitica(
  nombre: string,
  descripcion: string,
  acciones: string[],
  recursos: pulumi.Output<string>[] | string[],
  dependencias?: pulumi.Input<pulumi.Input<pulumi.Resource>[]>,
  tags?: aws.Tags
) {
  return new aws.iam.Policy(
    `${PREFIJO}_${nombre}-policy`,
    {
      name: nombre,
      path: "/",
      description: descripcion,
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: acciones,
            Effect: "Allow",
            Resource: recursos,
          },
        ],
      },
      tags: tags,
    },
    { dependsOn: dependencias }
  );
}
