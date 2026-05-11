import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class DatabaseSetupDto {
  @IsIn(['bundled', 'external'])
  mode!: 'bundled' | 'external';

  @IsString()
  @MinLength(2)
  host!: string;

  @IsInt()
  @Min(1)
  port!: number;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  user!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @IsOptional()
  @IsBoolean()
  rejectUnauthorized?: boolean;
}
