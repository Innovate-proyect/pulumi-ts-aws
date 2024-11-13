import * as aws from "@pulumi/aws";
import { PREFIJO } from "../env/variables";

export function createBucketPrivado(
  nombre: string,
  carpetas?: string[],
  tags?: aws.Tags
) {
  const bucket = new aws.s3.Bucket(`${PREFIJO}_s3-${nombre}`, {
    bucket: nombre,
    tags: tags,
  });
  if (carpetas && carpetas.length > 0) {
    for (const carpeta of carpetas) {
      new aws.s3.BucketObject(`${PREFIJO}_s3-${nombre}-${carpeta}-carpeta`, {
        bucket: bucket.bucket,
        key: `${carpeta}/`,
        content: "",
      });
    }
  }
  return bucket;
}
