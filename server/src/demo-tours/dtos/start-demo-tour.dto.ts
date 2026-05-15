import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StartDemoTourDto {
  @IsString()
  @MinLength(2)
  @MaxLength(96)
  firstName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(96)
  lastName?: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  businessName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  useCase?: string;
}
