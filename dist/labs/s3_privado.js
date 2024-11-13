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
exports.createBucketPrivado = createBucketPrivado;
const aws = __importStar(require("@pulumi/aws"));
const variables_1 = require("../env/variables");
function createBucketPrivado(nombre, carpetas, tags) {
    const bucket = new aws.s3.Bucket(`${variables_1.PREFIJO}_s3-${nombre}`, {
        bucket: nombre,
        tags: tags,
    });
    if (carpetas && carpetas.length > 0) {
        for (const carpeta of carpetas) {
            new aws.s3.BucketObject(`${variables_1.PREFIJO}_s3-${nombre}-${carpeta}-carpeta`, {
                bucket: bucket.bucket,
                key: `${carpeta}/`,
                content: "",
            });
        }
    }
    return bucket;
}
