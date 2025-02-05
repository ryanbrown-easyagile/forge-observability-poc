import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getApplicationId, getJWKSUrl } from '../util/context';
import { Request } from 'express';

export type ForgeToken = {
  app: {
    installationId: string;
    apiBaseUrl: string;
    id: string;
    version: string;
    environment: {
      type: string;
      id: string;
    };
    module: {
      type: string;
      key: string;
    };
    licence: {
      isActive: boolean;
      billingPeriod: string;
      ccpEntitlementId: string;
      ccpEntitlementSlug: string;
      isEvaluation: boolean;
      subscriptionEndDate: string;
      supportEntitlementNumber: string;
      trialEndDate: string;
      type: 'COMMERCIAL' | 'COMMUNITY' | 'ACADEMIC' | 'DEVELOPER';
    };
  };
  context: unknown;
  principal: string;
};

type RequestValidationResult = {
  isValid: boolean;
  failureReason?: string;
  token?: ForgeToken;
};

export async function validateRequest(
  request: Request
): Promise<RequestValidationResult> {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return { isValid: false, failureReason: 'No Authorization header' };
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token && token.trim().length === 0) {
    return { isValid: false, failureReason: 'No token provided' };
  }

  const jwks = createRemoteJWKSet(new URL(getJWKSUrl()));
  return jwtVerify<ForgeToken>(token, jwks, { audience: getApplicationId() })
    .then((result) => {
      return { isValid: true, token: result.payload };
    })
    .catch((err) => {
      return {
        isValid: false,
        failureReason: `JWT Verification failed: ${err.message}`,
      };
    });
}
