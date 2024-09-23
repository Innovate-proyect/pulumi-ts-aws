import { TPInputArrayCadena, TPInputCadena } from "./Iglobal";

export type IEvento =
  | { tipo: "s3"; parametros: IEventoS3 }
  | { tipo: "http"; parametros: IEventoHttp };

export interface IEventoHttp {
  path: string;
  method: "get" | "post" | "put" | "delete";
  cors?: boolean;
  private?: boolean;
  authorizer?: {
    name?: string;
    arn?: string;
    resultTtlInSeconds?: number;
    identitySource?: string;
    identityValidationExpression?: string;
    type?: "token" | "request";
  };
}

export interface IEventoS3 {
  nombreBucket: string;
  eventos: TPInputArrayCadena;
  prefigo: TPInputCadena;
  extencion: TPInputCadena;
}