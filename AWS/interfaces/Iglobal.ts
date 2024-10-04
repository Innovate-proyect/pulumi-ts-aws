import * as aws from "@pulumi/aws";
import * as pulumi from '@pulumi/pulumi';

export type TFuncion = aws.lambda.Function;
export type TCapa = aws.lambda.LayerVersion
export type TS3 = aws.s3.Bucket

export type TPInputCadena = pulumi.Input<string>
export type TPInputArn = pulumi.Input<aws.ARN>
export type TPInputNumero = pulumi.Input<number>
export type TPInputArrayArn = pulumi.Input<TPInputArn[]>
export type TPInputArrayCadena = pulumi.Input<TPInputCadena[]>
export type TPInputMapCadena = pulumi.Input<{
  [key: string]: TPInputCadena;
}>

export type TPInputDependencias = pulumi.Input<pulumi.Input<pulumi.Resource>[]>

export type TPythonVersion = '3.8' | '3.9' | '3.10' | '3.11' | '3.12';
export type TNodeVersion = '14.x' | '16.x' | '18.x' | '20.x';
export type TJavaVersion = '8' | '8.al2' | '11' | '17' | '21';