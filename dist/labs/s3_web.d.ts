import * as aws from "@pulumi/aws";
export declare function createBucketWeb(nombre: string, tags?: aws.Tags): import("@pulumi/aws/s3/bucket").Bucket;
