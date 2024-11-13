import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PREFIJO } from "../env/variables";

export function createBucketWeb(nombre: string, tags?: aws.Tags) {
  const bucket = new aws.s3.Bucket(`${PREFIJO}_s3-${nombre}`, {
    bucket: nombre,
    website: {
      indexDocument: "index.html",
      errorDocument: "error.html",
    },
    tags: tags,
  });
  new aws.s3.BucketOwnershipControls(`${PREFIJO}_s3-${nombre}-ownership`, {
    bucket: bucket.id,
    rule: { objectOwnership: "ObjectWriter" },
  });
  new aws.s3.BucketPublicAccessBlock(`${PREFIJO}_s3-${nombre}-access`, {
    bucket: bucket.id,
    blockPublicAcls: false,
  });
  new aws.s3.BucketPolicy(`${PREFIJO}_s3-${nombre}-attachment`, {
    bucket: bucket.bucket,
    policy: pulumi.output(bucket.arn).apply((bucketArn) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `${bucketArn}/*`,
          },
        ],
      })
    ),
  });

  return bucket;
}
