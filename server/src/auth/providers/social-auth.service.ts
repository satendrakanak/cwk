import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';

import appConfig from 'src/config/app.config';
import jwtConfig from '../config/jwt.config';
import { SettingsService } from 'src/settings/providers/settings.service';
import { SocialProvider } from 'src/settings/enums/social-provider.enum';
import {
  AuthAccount,
  AuthAccountProvider,
} from 'src/auth-accounts/auth-account.entity';
import { User } from 'src/users/user.entity';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { RolesPermissionsService } from 'src/roles-permissions/providers/roles-permissions.service';
import { GenerateUsernameProvider } from 'src/users/providers/generate-username.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';

type SocialStatePayload = {
  type: 'social_state';
  provider: AuthAccountProvider;
  callbackUrl: string;
};

type SocialEmailCompletionPayload = {
  type: 'social_email_completion';
  provider: AuthAccountProvider;
  providerUserId: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  displayName: string;
  avatarUrl?: string | null;
  callbackUrl: string;
};

type SocialProfile = {
  provider: AuthAccountProvider;
  providerUserId: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  displayName: string;
  avatarUrl?: string | null;
};

type SocialCallbackResult =
  | {
      mode: 'login';
      accessToken: string;
      refreshToken: string;
      redirectTo: string;
    }
  | {
      mode: 'collect_email';
      redirectTo: string;
    };

@Injectable()
export class SocialAuthService {
  constructor(
    @InjectRepository(AuthAccount)
    private readonly authAccountRepository: Repository<AuthAccount>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,

    private readonly settingsService: SettingsService,
    private readonly rolesPermissionsService: RolesPermissionsService,
    private readonly generateUsernameProvider: GenerateUsernameProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  async getAuthorizationUrl(
    providerInput: string,
    callbackUrl?: string,
  ): Promise<string> {
    const provider = this.normalizeProvider(providerInput);
    const settingsProvider = this.toSettingsProvider(provider);
    const config =
      await this.settingsService.getSocialAuthProviderConfig(settingsProvider);

    if (!config.isEnabled || !config.clientId) {
      throw new BadRequestException(
        'This social login provider is not enabled',
      );
    }

    const redirectUri = this.getProviderCallbackUrl(
      provider,
      config.redirectUrl,
    );
    const safeCallbackUrl = this.getSafeCallbackUrl(callbackUrl);
    const state = await this.signStateToken({
      type: 'social_state',
      provider,
      callbackUrl: safeCallbackUrl,
    });

    switch (provider) {
      case AuthAccountProvider.GOOGLE: {
        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'select_account',
          state,
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      }

      case AuthAccountProvider.META: {
        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'public_profile',
          state,
        });

        return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
      }

      case AuthAccountProvider.APPLE: {
        if (!config.clientSecret) {
          throw new BadRequestException(
            'Apple Sign In requires a client secret in social auth settings',
          );
        }

        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          response_mode: 'form_post',
          scope: 'name email',
          state,
        });

        return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
      }

      default:
        throw new BadRequestException('Unsupported social login provider');
    }
  }

  async handleCallback(
    providerInput: string,
    payload: {
      code?: string;
      state?: string;
      user?: unknown;
    },
  ): Promise<SocialCallbackResult> {
    const provider = this.normalizeProvider(providerInput);

    if (!payload.code || !payload.state) {
      throw new BadRequestException('Missing social login callback payload');
    }

    const state = await this.verifyStateToken(payload.state, provider);
    const profile = await this.exchangeCodeForProfile(
      provider,
      payload.code,
      payload.user,
    );

    /**
     * Important:
     * Meta may not return email on every login.
     * So first try to find user by provider + providerUserId.
     */
    const existingUser = await this.findUserByAuthAccount(
      provider,
      profile.providerUserId,
    );

    if (existingUser) {
      if (profile.avatarUrl && !existingUser.avatarUrl) {
        await this.userRepository.update(
          { id: existingUser.id },
          { avatarUrl: profile.avatarUrl },
        );

        existingUser.avatarUrl = profile.avatarUrl;
      }

      const tokens =
        await this.generateTokensProvider.generateTokens(existingUser);

      return {
        mode: 'login',
        ...tokens,
        redirectTo: this.buildFrontendUrl(state.callbackUrl),
      };
    }

    /**
     * If no linked account exists and email is missing,
     * only then ask user to complete email manually.
     */

    if (!profile.email) {
      const token = await this.signEmailCompletionToken({
        type: 'social_email_completion',
        provider,
        providerUserId: profile.providerUserId,
        email: null,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        callbackUrl: state.callbackUrl,
      });

      return {
        mode: 'collect_email',
        redirectTo: this.buildFrontendUrl(
          `/auth/social/complete?token=${encodeURIComponent(token)}&provider=${provider}`,
        ),
      };
    }

    const user = await this.findOrCreateUser(profile);
    const tokens = await this.generateTokensProvider.generateTokens(user);

    return {
      mode: 'login',
      ...tokens,
      redirectTo: this.buildFrontendUrl(state.callbackUrl),
    };
  }

  async completeMissingEmail(token: string, email: string) {
    const payload = await this.verifyEmailCompletionToken(token);

    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.findOrCreateUser({
      provider: payload.provider,
      providerUserId: payload.providerUserId,
      email: normalizedEmail,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
    });

    const tokens = await this.generateTokensProvider.generateTokens(user);

    return {
      ...tokens,
      redirectTo: this.buildFrontendUrl(payload.callbackUrl),
    };
  }

  private async findOrCreateUser(profile: SocialProfile): Promise<User> {
    const existingAccount = await this.authAccountRepository.findOne({
      where: {
        provider: profile.provider,
        providerUserId: profile.providerUserId,
      },
      relations: [
        'user',
        'user.roles',
        'user.profile',
        'user.avatar',
        'user.coverImage',
        'user.facultyProfile',
      ],
    });

    if (existingAccount?.user) {
      return this.updateUserAvatarFromSocialProfile(
        existingAccount.user,
        profile,
      );
    }

    const normalizedEmail = profile.email
      ? this.normalizeEmail(profile.email)
      : null;

    if (normalizedEmail) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
        },
        relations: this.getUserRelations(),
      });

      if (existingUser) {
        await this.linkAuthAccount(existingUser, {
          ...profile,
          email: normalizedEmail,
        });

        return existingUser;
      }

      /**
       * Important:
       * Agar same email soft-deleted user me hai, TypeORM normal findOne me nahi milega,
       * but Postgres unique constraint phir bhi duplicate error dega.
       */
      const deletedUser = await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
        },
        withDeleted: true,
        relations: this.getUserRelations(),
      });

      if (deletedUser?.deletedAt) {
        await this.userRepository.restore(deletedUser.id);

        const restoredUser = await this.userRepository.findOne({
          where: {
            id: deletedUser.id,
          },
          relations: this.getUserRelations(),
        });

        if (!restoredUser) {
          throw new BadRequestException('Unable to restore deleted account');
        }

        await this.linkAuthAccount(restoredUser, {
          ...profile,
          email: normalizedEmail,
        });

        return this.updateUserAvatarFromSocialProfile(restoredUser, {
          ...profile,
          email: normalizedEmail,
        });
      }
    }

    const studentRole =
      await this.rolesPermissionsService.findRoleByName('student');

    const usernameSeed =
      normalizedEmail || `${profile.providerUserId}@${profile.provider}.social`;

    const username =
      await this.generateUsernameProvider.generateUsername(usernameSeed);

    const user = this.userRepository.create({
      firstName: profile.firstName,
      lastName: profile.lastName || undefined,
      email: normalizedEmail || `${username}@${profile.provider}.local`,
      username,
      avatarUrl: profile.avatarUrl,
      password: null,
      phoneNumber: null,
      emailVerified: new Date(),
      roles: [studentRole],
    });

    let savedUser: User;

    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      /**
       * Postgres unique violation.
       * Race condition ya existing email/username ke case me fallback.
       */
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505' &&
        normalizedEmail
      ) {
        const existingUser = await this.userRepository.findOne({
          where: {
            email: normalizedEmail,
          },
          relations: this.getUserRelations(),
        });

        if (existingUser) {
          await this.linkAuthAccount(existingUser, {
            ...profile,
            email: normalizedEmail,
          });

          return this.updateUserAvatarFromSocialProfile(existingUser, profile);
        }
      }

      throw error;
    }

    await this.userProfileRepository.save(
      this.userProfileRepository.create({
        user: savedUser,
      }),
    );

    await this.linkAuthAccount(savedUser, {
      ...profile,
      email: normalizedEmail,
    });

    return (
      (await this.userRepository.findOne({
        where: {
          id: savedUser.id,
        },
        relations: this.getUserRelations(),
      })) || savedUser
    );
  }

  private async linkAuthAccount(user: User, profile: SocialProfile) {
    const existing = await this.authAccountRepository.findOne({
      where: {
        provider: profile.provider,
        providerUserId: profile.providerUserId,
      },
    });

    if (existing) {
      return existing;
    }

    const account = this.authAccountRepository.create({
      user,
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      email: profile.email ? this.normalizeEmail(profile.email) : null,
    });

    return this.authAccountRepository.save(account);
  }

  private async exchangeCodeForProfile(
    provider: AuthAccountProvider,
    code: string,
    appleUserPayload?: unknown,
  ): Promise<SocialProfile> {
    const config = await this.settingsService.getSocialAuthProviderConfig(
      this.toSettingsProvider(provider),
    );
    const redirectUri = this.getProviderCallbackUrl(
      provider,
      config.redirectUrl,
    );

    if (!config.clientId || !config.clientSecret) {
      throw new BadRequestException(
        'Social provider credentials are incomplete',
      );
    }

    if (provider === AuthAccountProvider.GOOGLE) {
      const tokenResponse = await this.fetchJson<{
        access_token: string;
      }>('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const userInfo = await this.fetchJson<{
        sub: string;
        email?: string;
        given_name?: string;
        family_name?: string;
        name?: string;
        picture?: string;
      }>('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      return {
        provider,
        providerUserId: userInfo.sub,
        email: userInfo.email ? this.normalizeEmail(userInfo.email) : null,
        firstName: userInfo.given_name || this.getFirstName(userInfo.name),
        lastName: userInfo.family_name || this.getLastName(userInfo.name),
        displayName:
          userInfo.name ||
          `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
        avatarUrl: userInfo.picture || null,
      };
    }

    if (provider === AuthAccountProvider.META) {
      const tokenResponse = await this.fetchJson<{
        access_token: string;
      }>(
        'https://graph.facebook.com/v23.0/oauth/access_token?' +
          new URLSearchParams({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: redirectUri,
          }).toString(),
      );

      const userInfo = await this.fetchJson<{
        id: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        name?: string;
        picture?: { data: { url: string } };
      }>(
        `https://graph.facebook.com/me?${new URLSearchParams({
          fields: 'id,first_name,last_name,name,email,picture',
          access_token: tokenResponse.access_token,
        }).toString()}`,
      );

      return {
        provider,
        providerUserId: userInfo.id,
        email: userInfo.email ? this.normalizeEmail(userInfo.email) : null,
        firstName: userInfo.first_name || this.getFirstName(userInfo.name),
        lastName: userInfo.last_name || this.getLastName(userInfo.name),
        displayName:
          userInfo.name ||
          `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        avatarUrl: userInfo.picture?.data?.url || null,
      };
    }

    const tokenResponse = await this.fetchJson<{
      id_token: string;
    }>('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const idTokenPayload = this.decodeJwtPayload<{
      sub: string;
      email?: string;
    }>(tokenResponse.id_token);

    const appleUser = this.parseAppleUser(appleUserPayload);
    const firstName =
      appleUser?.name?.firstName ||
      this.getFirstName(appleUser?.email || idTokenPayload.email);
    const lastName =
      appleUser?.name?.lastName ||
      this.getLastName(appleUser?.email || idTokenPayload.email);

    return {
      provider,
      providerUserId: idTokenPayload.sub,
      email: idTokenPayload.email
        ? this.normalizeEmail(idTokenPayload.email)
        : null,
      firstName: firstName || 'Apple',
      lastName: lastName || null,
      displayName:
        `${firstName || ''} ${lastName || ''}`.trim() ||
        idTokenPayload.email ||
        'Apple user',
    };
  }

  private normalizeProvider(providerInput: string): AuthAccountProvider {
    const normalized = providerInput.toLowerCase();

    if (
      normalized !== AuthAccountProvider.GOOGLE &&
      normalized !== AuthAccountProvider.APPLE &&
      normalized !== AuthAccountProvider.META
    ) {
      throw new BadRequestException('Unsupported social login provider');
    }

    return normalized as AuthAccountProvider;
  }

  private toSettingsProvider(provider: AuthAccountProvider): SocialProvider {
    switch (provider) {
      case AuthAccountProvider.GOOGLE:
        return SocialProvider.GOOGLE;
      case AuthAccountProvider.APPLE:
        return SocialProvider.APPLE;
      case AuthAccountProvider.META:
        return SocialProvider.META;
    }
  }

  private getProviderCallbackUrl(
    provider: AuthAccountProvider,
    configuredRedirectUrl?: string | null,
  ) {
    return (
      configuredRedirectUrl ||
      `${this.appConfiguration.appUrl}:${this.appConfiguration.appPort}/auth/social/${provider}/callback`
    );
  }

  private getSafeCallbackUrl(callbackUrl?: string) {
    if (
      callbackUrl &&
      callbackUrl.startsWith('/') &&
      !callbackUrl.startsWith('//')
    ) {
      return callbackUrl;
    }

    return '/dashboard';
  }

  private buildFrontendUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${this.appConfiguration.fronEndUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  public buildErrorRedirect(message: string, path = '/auth/sign-in') {
    const params = new URLSearchParams({
      error: message,
    });

    return this.buildFrontendUrl(`${path}?${params.toString()}`);
  }

  private async signStateToken(payload: SocialStatePayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn: '10m',
    });
  }

  private async verifyStateToken(token: string, provider: AuthAccountProvider) {
    const payload = await this.jwtService.verifyAsync<SocialStatePayload>(
      token,
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );

    if (payload.type !== 'social_state' || payload.provider !== provider) {
      throw new UnauthorizedException('Invalid social login state');
    }

    return payload;
  }

  private async signEmailCompletionToken(
    payload: SocialEmailCompletionPayload,
  ) {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn: '15m',
    });
  }

  private async verifyEmailCompletionToken(token: string) {
    const payload =
      await this.jwtService.verifyAsync<SocialEmailCompletionPayload>(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

    if (payload.type !== 'social_email_completion') {
      throw new UnauthorizedException('Invalid social completion token');
    }

    return payload;
  }

  private async findUserByAuthAccount(
    provider: AuthAccountProvider,
    providerUserId: string,
  ): Promise<User | null> {
    const authAccount = await this.authAccountRepository.findOne({
      where: {
        provider,
        providerUserId,
      },
      relations: [
        'user',
        'user.roles',
        'user.profile',
        'user.avatar',
        'user.coverImage',
        'user.facultyProfile',
      ],
    });

    return authAccount?.user ?? null;
  }
  private getUserRelations() {
    return ['roles', 'profile', 'avatar', 'coverImage', 'facultyProfile'];
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      throw new BadRequestException(
        `Social provider request failed: ${response.status} ${text}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private decodeJwtPayload<T>(token: string): T {
    const [, payload] = token.split('.');

    if (!payload) {
      throw new BadRequestException('Invalid social identity token');
    }

    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T;
  }

  private parseAppleUser(value?: unknown) {
    if (!value) return null;

    if (typeof value === 'object') {
      return value as {
        name?: { firstName?: string; lastName?: string };
        email?: string;
      };
    }

    try {
      return JSON.parse(String(value)) as {
        name?: { firstName?: string; lastName?: string };
        email?: string;
      };
    } catch {
      return null;
    }
  }

  private async updateUserAvatarFromSocialProfile(
    user: User,
    profile: SocialProfile,
  ): Promise<User> {
    if (!profile.avatarUrl) {
      return user;
    }

    await this.userRepository.update(
      { id: user.id },
      {
        avatarUrl: profile.avatarUrl,
      },
    );

    return {
      ...user,
      avatarUrl: profile.avatarUrl,
    } as User;
  }

  private getFirstName(value?: string | null) {
    if (!value) return 'Learner';
    return value.split(' ').filter(Boolean)[0] || 'Learner';
  }

  private getLastName(value?: string | null) {
    if (!value) return null;
    const parts = value.split(' ').filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join(' ') : null;
  }
}
