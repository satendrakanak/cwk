import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GenerateTokensProvider } from './generate-tokens.provider';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { UsersService } from 'src/users/providers/users.service';
import { LicensesService } from 'src/licenses/providers/licenses.service';
import { User } from 'src/users/user.entity';

const canManageLicense = (user: User) => {
  const roles = user.roles?.map((role) => role.name.toLowerCase()) ?? [];

  return roles.includes('super_admin') || roles.includes('admin');
};

const isExpiredDemoUser = (user: User) =>
  Boolean(
    user.isDemo &&
      user.demoExpiresAt &&
      user.demoExpiresAt.getTime() <= Date.now(),
  );

@Injectable()
export class RefreshTokensProvider {
  constructor(
    /* Injecting usersService */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject generateTokensProvider
     */

    private readonly generateTokensProvider: GenerateTokensProvider,

    /**
     * Inject jwtService
     */

    private readonly jwtService: JwtService,

    /**
     * Inject jwtConfiguration
     */

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly licensesService: LicensesService,
  ) {}

  public async refreshTokens(refreshToken: string) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.usersService.findOneById(sub);

      if (isExpiredDemoUser(user)) {
        throw new UnauthorizedException('Demo access expired');
      }

      try {
        await this.licensesService.assertActiveLicense();
      } catch (error) {
        if (!canManageLicense(user)) {
          throw error;
        }
      }

      return this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
