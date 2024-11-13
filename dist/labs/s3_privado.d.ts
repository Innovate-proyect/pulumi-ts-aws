import * as aws from "@pulumi/aws";
export declare function createBucketPrivado(nombre: string, carpetas?: string[], tags?: aws.Tags): import("@pulumi/aws/s3/bucket").Bucket;
