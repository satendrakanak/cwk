import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dtos/sign-in.dto';
import { AuthService } from './providers/auth.service';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignupDto } from './dtos/sign-up.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { User } from 'src/users/user.entity';
import type { Response as ExpressResponse, Request } from 'express';
import { httpOnlyCookieOptions } from './cookies/cookies-options';
import { UsersService } from 'src/users/providers/users.service';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { StartCheckoutVerificationDto } from './dtos/start-checkout-verification.dto';
import { VerifyCheckoutOtpDto } from './dtos/verify-checkout-otp.dto';
import { StartCheckoutVerificationProvider } from './providers/start-checkout-verification.provider';
import { VerifyCheckoutOtpProvider } from './providers/verify-checkout-otp.provider';
import { StartSignupVerificationProvider } from './providers/start-signup-verification.provider';
import { VerifySignupOtpProvider } from './providers/verify-signup-otp.provider';
import { SocialAuthService } from './providers/social-auth.service';
import { CompleteSocialAuthDto } from './dtos/complete-social-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    /**
     * Inject authService
     */

    private readonly authService: AuthService,

    /**
     * Inject usersService
     */

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly startSignupVerificationProvider: StartSignupVerificationProvider,
    private readonly verifySignupOtpProvider: VerifySignupOtpProvider,
    private readonly startCheckoutVerificationProvider: StartCheckoutVerificationProvider,
    private readonly verifyCheckoutOtpProvider: VerifyCheckoutOtpProvider,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<ApiResponse<null>> {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);
    res.cookie('accessToken', accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', refreshToken, httpOnlyCookieOptions);

    return {
      success: true,
      message: 'User logged in successfully',
      data: null,
    };
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.sub;
    return await this.usersService.findOneById(userId);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  public async signUp(
    @Body() signupDto: SignupDto,
  ): Promise<ApiResponse<{ email: string; maskedEmail: string; isExistingUser: boolean }>> {
    const result = await this.startSignupVerificationProvider.start(signupDto);
    return {
      success: true,
      message: 'Verification code sent to your email',
      data: result,
    };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-up/verify-otp')
  async verifySignupOtp(
    @Body() verifyCheckoutOtpDto: VerifyCheckoutOtpDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.verifySignupOtpProvider.verify(
        verifyCheckoutOtpDto.email,
        verifyCheckoutOtpDto.code,
      );

    res.cookie('accessToken', accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', refreshToken, httpOnlyCookieOptions);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  @Auth(AuthType.None)
  @Post('sign-out')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    this.clearAuthCookies(res);

    return {
      message: 'Logged out successfully',
    };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  public async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Session expired');
    }

    try {
      const { accessToken, refreshToken } =
        await this.authService.refreshTokens(oldRefreshToken);
      res.cookie('accessToken', accessToken, httpOnlyCookieOptions);
      res.cookie('refreshToken', refreshToken, httpOnlyCookieOptions);
      return { success: true };
    } catch (error) {
      this.clearAuthCookies(res);
      throw error;
    }
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyEmail(token);
    res.cookie('accessToken', accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', refreshToken, httpOnlyCookieOptions);

    return { success: true };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('checkout/start-verification')
  async startCheckoutVerification(
    @Body() startCheckoutVerificationDto: StartCheckoutVerificationDto,
  ) {
    const result = await this.startCheckoutVerificationProvider.start(
      startCheckoutVerificationDto,
    );

    return {
      success: true,
      message: 'Verification code sent to your email',
      data: result,
    };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('checkout/verify-otp')
  async verifyCheckoutOtp(
    @Body() verifyCheckoutOtpDto: VerifyCheckoutOtpDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.verifyCheckoutOtpProvider.verify(
        verifyCheckoutOtpDto.email,
        verifyCheckoutOtpDto.code,
      );

    res.cookie('accessToken', accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', refreshToken, httpOnlyCookieOptions);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  @Auth(AuthType.None)
  @Get('social/:provider/start')
  async startSocialAuth(
    @Param('provider') provider: string,
    @Query('callbackUrl') callbackUrl: string | undefined,
    @Res() res: ExpressResponse,
  ) {
    try {
      const redirectUrl = await this.socialAuthService.getAuthorizationUrl(
        provider,
        callbackUrl,
      );

      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect(
        this.socialAuthService.buildErrorRedirect(
          this.getSocialAuthErrorMessage(error),
        ),
      );
    }
  }

  @Auth(AuthType.None)
  @Get('social/:provider/callback')
  async handleSocialAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: ExpressResponse,
  ) {
    try {
      const result = await this.socialAuthService.handleCallback(provider, {
        code,
        state,
      });

      if (result.mode === 'collect_email') {
        return res.redirect(result.redirectTo);
      }

      res.cookie('accessToken', result.accessToken, httpOnlyCookieOptions);
      res.cookie('refreshToken', result.refreshToken, httpOnlyCookieOptions);

      return res.redirect(result.redirectTo);
    } catch (error) {
      return res.redirect(
        this.socialAuthService.buildErrorRedirect(
          this.getSocialAuthErrorMessage(error),
        ),
      );
    }
  }

  @Auth(AuthType.None)
  @Post('social/apple/callback')
  async handleAppleSocialAuthCallback(
    @Body('code') code: string | undefined,
    @Body('state') state: string | undefined,
    @Body('user') user: unknown,
    @Res() res: ExpressResponse,
  ) {
    try {
      const result = await this.socialAuthService.handleCallback('apple', {
        code,
        state,
        user,
      });

      if (result.mode === 'collect_email') {
        return res.redirect(result.redirectTo);
      }

      res.cookie('accessToken', result.accessToken, httpOnlyCookieOptions);
      res.cookie('refreshToken', result.refreshToken, httpOnlyCookieOptions);

      return res.redirect(result.redirectTo);
    } catch (error) {
      return res.redirect(
        this.socialAuthService.buildErrorRedirect(
          this.getSocialAuthErrorMessage(error),
        ),
      );
    }
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('social/complete-email')
  async completeSocialAuthEmail(
    @Body() body: CompleteSocialAuthDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.socialAuthService.completeMissingEmail(
      body.token,
      body.email,
    );

    res.cookie('accessToken', result.accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', result.refreshToken, httpOnlyCookieOptions);

    return {
      success: true,
      message: 'Social account connected successfully',
      data: {
        redirectTo: result.redirectTo,
      },
    };
  }

  private getSocialAuthErrorMessage(error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }

    return 'Unable to continue social sign in. Please try again.';
  }

  private clearAuthCookies(res: ExpressResponse) {
    res.clearCookie('accessToken', httpOnlyCookieOptions);
    res.clearCookie('refreshToken', httpOnlyCookieOptions);
  }
}
