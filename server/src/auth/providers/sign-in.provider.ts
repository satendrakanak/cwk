import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import { SignInDto } from '../dtos/sign-in.dto';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { User } from 'src/users/user.entity';

export type SignInUserSummary = {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
};

export type SignInResult = {
  accessToken: string;
  refreshToken: string;
  user: SignInUserSummary;
  defaultRedirect: string;
};

const getDefaultRedirectForUser = (user: User) => {
  const roles = user.roles?.map((role) => role.name.toLowerCase()) ?? [];

  if (roles.includes('admin')) return '/admin/dashboard';
  if (roles.includes('faculty')) return '/faculty/dashboard';

  return '/dashboard';
};

const toSignInUserSummary = (user: User): SignInUserSummary => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  roles:
    user.roles?.map((role) => ({
      id: role.id,
      name: role.name,
    })) ?? [],
});

@Injectable()
export class SignInProvider {
  constructor(
    /**
     * Inject hashingProvider
     */

    private readonly hashingProvider: HashingProvider,

    /**
     * Inject usersService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject generateTokensProvider
     */

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async signIn(signInDto: SignInDto): Promise<SignInResult> {
    //Find user by email

    let user = await this.usersService.findOneByEmail(signInDto.email);
    //Throw an exception if user not found
    if (!user) {
      throw new NotFoundException('User not exist');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created with social login. Use the social sign-in option or set a password first.',
      );
    }
    //Compare password to the hash

    let isEqual: boolean = false;

    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Unable to compare password to hash',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Password is incorrect', {
        description: 'Password is incorrect',
      });
    }

    const tokens = await this.generateTokensProvider.generateTokens(user);

    return {
      ...tokens,
      user: toSignInUserSummary(user),
      defaultRedirect: getDefaultRedirectForUser(user),
    };
  }
}
