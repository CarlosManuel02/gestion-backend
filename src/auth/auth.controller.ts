import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('new')
  @UseInterceptors(FileInterceptor('file')) // Aquí se define el nombre del campo del formulario que contiene el archivo
  Register(@UploadedFile() file, @Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto, file);
  }

  @Post('login')
  Login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  // @UseGuards(AuthGuard())
  @Get('/all')
  findAll(@Query() pagination: PaginationDto) {
    return this.authService.findAll(pagination);
  }

  // @UseGuards(AuthGuard())
  @Get('/:term')
  findOne(@Param('term') term: string) {
    return this.authService.findBy(term);
  }

  // @UseGuards(AuthGuard())
  @Post('/renew')
  getToken(@Req() req) {
    const token = req.headers.token;
    // console.log(token)
    return this.authService.renewToken(token);
  }

  @UseGuards(AuthGuard())
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @UseGuards(AuthGuard())
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Patch('forgot-password')
  forgotPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(requestResetPasswordDto);
  }

  @Patch('verify-code')
  verifyCode(@Body() token: RequestResetPasswordDto) {
    return this.authService.verifyCode(token.code);
  }

  @Patch('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
