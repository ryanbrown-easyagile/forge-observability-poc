import { Request } from 'express';
export interface Context {
  userAccountId: string;
  clientKey: string;
  context?: {
    jira: {
      project?: {
        id: string;
      };
    };
  };
}

export type AceRequest<Params, ResBody, ReqBody> = Request<
  Params,
  ResBody,
  ReqBody
> & {
  context: Context;
};
