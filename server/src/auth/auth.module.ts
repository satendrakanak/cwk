import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { HashingProvider } from './providers/hashing.provider';
import { UsersModule } from 'src/users/users.module';
import { SignInProvider } from './providers/sign-in.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationToken } from './verification-token.entity';
import { GenerateVerificationTokenProvider } from './providers/generate-verification-token.provider';
import { VerifyEmailProvider } from './providers/verify-email.provider';
import { VerificationTokenService } from './providers/verification-token.service';
import { ForgotPasswordProvider } from './providers/forgot-password.provider';
import { ResetPasswordProvider } from './providers/reset-password.provider';
import { User } from 'src/users/user.entity';
import { AuthAccount } from 'src/auth-accounts/auth-account.entity';
import { StartCheckoutVerificationProvider } from './providers/start-checkout-verification.provider';
import { VerifyCheckoutOtpProvider } from './providers/verify-checkout-otp.provider';
import { StartSignupVerificationProvider } from './providers/start-signup-verification.provider';
import { VerifySignupOtpProvider } from './providers/verify-signup-otp.provider';
import { SettingsModule } from 'src/settings/settings.module';
import { RolesPermissionsModule } from 'src/roles-permissions/roles-permissions.module';
import { SocialAuthService } from './providers/social-auth.service';
import { UserProfile } from 'src/profiles/user-profile.entity';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    SettingsModule,
    RolesPermissionsModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forFeature([VerificationToken, User, AuthAccount, UserProfile]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BcryptProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    SignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    GenerateVerificationTokenProvider,
    VerifyEmailProvider,
    VerificationTokenService,
    ForgotPasswordProvider,
    ResetPasswordProvider,
    StartSignupVerificationProvider,
    VerifySignupOtpProvider,
    StartCheckoutVerificationProvider,
    VerifyCheckoutOtpProvider,
    SocialAuthService,
  ],
  exports: [
    AuthService,
    HashingProvider,
    GenerateVerificationTokenProvider,
  ],
})
export class AuthModule {}
