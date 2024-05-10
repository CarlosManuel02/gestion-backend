import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RequestResetPasswordDto {
  @IsEmail()
  @IsOptional()
  email: string;


  @IsString()
  @IsOptional()
  code: string;
}
