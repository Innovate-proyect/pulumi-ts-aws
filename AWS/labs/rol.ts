import * as aws from "@pulumi/aws";
import { PREFIJO } from "../env/variables";
import { stringTo8Char } from "../models/utils";
import * as pulumi from "@pulumi/pulumi";

export function createRole(
  nombre: string,
  servicio: string,
  descripcion: string,
  politicasArn: pulumi.Input<string>[] = [],
  tags?: aws.Tags
) {
  const rolLambda = new aws.iam.Role(`${PREFIJO}_${nombre}`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: servicio,
    }),
    name: `${PREFIJO}_${nombre}`,
    description: descripcion,
    managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
    tags: tags,
  });

  politicasArn.forEach((arn) => {
    pulumi.output(arn).apply((resolvedArn) => {
      const hash = stringTo8Char(resolvedArn);
      new aws.iam.RolePolicyAttachment(
        `${nombre}-attach-${hash}`,
        {
          role: rolLambda.name,
          policyArn: resolvedArn,
        },
        { dependsOn: [rolLambda] }
      );
    });
  });
  return rolLambda;
}
