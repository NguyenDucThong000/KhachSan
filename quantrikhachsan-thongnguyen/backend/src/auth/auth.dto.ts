import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}

export class RegisterDto {
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

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  full_name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(15)
  phone: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  cccd_passport: string;
}

export interface AuthenticatedUser {
  sub: number;
  username: string;
  role: string;
}
