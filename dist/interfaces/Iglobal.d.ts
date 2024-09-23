import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi';
export type TFuncion = aws.lambda.Function;
export type TCapa = aws.lambda.LayerVersion;
export type TPInputCadena = pulumi.Input<string>;
export type TPInputArn = pulumi.Input<aws.ARN>;
export type TPInputNumero = pulumi.Input<number>;
export type TPInputArrayArn = pulumi.Input<TPInputArn[]>;
export type TPInputArrayCadena = pulumi.Input<TPInputCadena[]>;
export type TPInputMapCadena = pulumi.Input<{
    [key: string]: TPInputCadena;
}>;
export type TPInputDependencias = pulumi.Input<pulumi.Input<pulumi.Resource>[]>;
