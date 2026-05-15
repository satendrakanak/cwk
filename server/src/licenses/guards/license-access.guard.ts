import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { LicensesService } from '../providers/licenses.service';

const RECOVERY_ROUTE_PREFIXES = [
  '/auth',
  '/demo-tours',
  '/installer',
  '/licenses',
  '/settings/public',
  '/settings/social-auth/active',
  '/settings/gateways/active',
  '/settings/payment-config',
  '/notifications/push/public-key',
  '/orders/webhook',
];

@Injectable()
export class LicenseAccessGuard implements CanActivate {
  constructor(private readonly licensesService: LicensesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = this.getRequestPath(request);

    if (request.method === 'OPTIONS' || this.isRecoveryRoute(path)) {
      return true;
    }

    const summary = await this.licensesService.getCurrent();

    if (summary.license?.status === 'active' && summary.plan) {
      return true;
    }

    throw new HttpException(
      {
        code: this.getReasonCode(summary.license?.status),
        message: this.getReasonMessage(summary.license?.status),
        upgradeUrl: 'https://getkasa.in/#pricing',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  private getRequestPath(request: Request) {
    const originalUrl = request.originalUrl || request.url || '';
    const [path = '/'] = originalUrl.split('?');

    return path.startsWith('/') ? path : `/${path}`;
  }

  private isRecoveryRoute(path: string) {
    return RECOVERY_ROUTE_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
  }

  private getReasonCode(status?: string) {
    if (status === 'expired') return 'LICENSE_EXPIRED';
    if (status === 'revoked') return 'LICENSE_INVALID';

    return 'LICENSE_NOT_CONFIGURED';
  }

  private getReasonMessage(status?: string) {
    if (status === 'expired') {
      return 'KASA license has expired. Please renew or upgrade your plan to continue.';
    }

    if (status === 'revoked') {
      return 'KASA license is invalid or has been deactivated. Activate a valid key to continue.';
    }

    return 'KASA license is not configured. Activate a valid key to use this workspace.';
  }
}
