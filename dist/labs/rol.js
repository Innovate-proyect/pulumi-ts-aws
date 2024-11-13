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
exports.createRole = createRole;
const aws = __importStar(require("@pulumi/aws"));
const variables_1 = require("../env/variables");
const utils_1 = require("../models/utils");
const pulumi = __importStar(require("@pulumi/pulumi"));
function createRole(nombre, servicio, descripcion, politicasArn = [], tags) {
    const rolLambda = new aws.iam.Role(`${variables_1.PREFIJO}_${nombre}`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: servicio,
        }),
        name: `${variables_1.PREFIJO}_${nombre}`,
        description: descripcion,
        tags: tags,
    });
    politicasArn.forEach((arn) => {
        pulumi.output(arn).apply((resolvedArn) => {
            const hash = (0, utils_1.stringTo8Char)(resolvedArn);
            new aws.iam.RolePolicyAttachment(`${nombre}-attach-${hash}`, {
                role: rolLambda.name,
                policyArn: resolvedArn,
            }, { dependsOn: [rolLambda] });
        });
    });
    return rolLambda;
}
