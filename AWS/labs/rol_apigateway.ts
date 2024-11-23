import * as aws from "@pulumi/aws";
import { PREFIJO } from "../env/variables";

export function createApiGatewayRole(
  nombre: string,
  descripcion: string,
  tags?: aws.Tags
) {
  const rolApiGateway = new aws.iam.Role(`${PREFIJO}_${nombre}`, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: "apigateway.amazonaws.com",
    }),
    name: `${PREFIJO}_${nombre}`,
    description: descripcion,
    managedPolicyArns: [aws.iam.ManagedPolicy.AmazonAPIGatewayPushToCloudWatchLogs],
    tags: tags,
  });
  new aws.apigateway.Account(`${PREFIJO}_accountResource`, {
    cloudwatchRoleArn: rolApiGateway.arn,
  });
  return rolApiGateway;
}
