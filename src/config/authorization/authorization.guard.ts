import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { expressjwt } from 'express-jwt';
import { GetVerificationKey, expressJwtSecret } from 'jwks-rsa';
import { promisify } from 'util';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  // which will populate in our construction function with the configuration data from .env
  private AUTH0_AUDIENCE: string;
  private AUTH0_DOMAIN: string;

  // using the config service to gather all AUTH0 AUDIENCE and DOMAIN from .env
  constructor(private readonly configService: ConfigService) {
    this.AUTH0_AUDIENCE = this.configService.get('AUTH0_ADIENCE');
    this.AUTH0_DOMAIN = this.configService.get('AUTH0_DOMAIN');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.getArgByIndex(0);
    const res = context.getArgByIndex(1);
    // will return JWT middleware and will accept a confiuration object
    const checkJwt = promisify(
      expressjwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          // limited the request for Json web keys to 5 per min
          jwksRequestsPerMinute: 5,
          // able to fetch public keys to validate the JWT signature
          jwksUri: `${this.AUTH0_DOMAIN}.well-known/jwks.json`,
        }) as GetVerificationKey,
        audience: this.AUTH0_AUDIENCE,
        issuer: this.AUTH0_DOMAIN,
        algorithms: ['RS256'],
      }),
    );

    try {
      await checkJwt(req, res);
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
