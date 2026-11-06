import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsInt()
  role_id: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
