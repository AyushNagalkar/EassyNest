import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard but allows unauthenticated requests through.
 * If a valid JWT is present, req.user is populated.
 * If not, the request continues with req.user = undefined (no 401).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Call the parent canActivate which runs Passport's JWT strategy
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw on missing/invalid token — just return null
    if (err || !user) {
      return null;
    }
    return user;
  }
}
