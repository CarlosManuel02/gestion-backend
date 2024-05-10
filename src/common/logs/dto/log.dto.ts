// CREATE TABLE Logs (
//   id UUID PRIMARY KEY,
//   user_id UUID NOT NULL,
//   action VARCHAR NOT NULL,
//   createdAt TIMESTAMP
// );

import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LogDto {

  // @IsString()
  // @IsOptional()
  // id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsDate()
  createdAt: Date;
}