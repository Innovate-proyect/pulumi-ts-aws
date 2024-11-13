"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBucketWeb = createBucketWeb;
const aws = __importStar(require("@pulumi/aws"));
const pulumi = __importStar(require("@pulumi/pulumi"));
const variables_1 = require("../env/variables");
function createBucketWeb(nombre, tags) {
    const bucket = new aws.s3.Bucket(`${variables_1.PREFIJO}_s3-${nombre}`, {
        bucket: nombre,
        website: {
            indexDocument: "index.html",
            errorDocument: "error.html",
        },
        tags: tags,
    });
    new aws.s3.BucketOwnershipControls(`${variables_1.PREFIJO}_s3-${nombre}-ownership`, {
        bucket: bucket.id,
        rule: { objectOwnership: "ObjectWriter" },
    });
    new aws.s3.BucketPublicAccessBlock(`${variables_1.PREFIJO}_s3-${nombre}-access`, {
        bucket: bucket.id,
        blockPublicAcls: false,
    });
    new aws.s3.BucketPolicy(`${variables_1.PREFIJO}_s3-${nombre}-attachment`, {
        bucket: bucket.bucket,
        policy: pulumi.output(bucket.arn).apply((bucketArn) => JSON.stringify({
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
        })),
    });
    return bucket;
}
