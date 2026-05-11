import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class BillingAddressDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  phoneNumber!: string;

  @IsString()
  @MinLength(5)
  address!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  pincode!: string;
}
