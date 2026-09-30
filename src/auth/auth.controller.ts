import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from '../common/decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { validRoles } from './interfaces/valid-roles';
import { Auth, RoleProtected } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get("check-auth-status")
  @Auth()
  checkAuthStatus(@GetUser() user: User){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[]
  ) {
   // console.log(request);
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      email,
      rawHeaders
    };
  }

  //@SetMetadata("roles", ["admin", "super-user"])
  @Get("private2")
  @RoleProtected(validRoles.superUser, validRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User){
    return {
      ok: true,
      user
    }
  }

  @Get("private3")
  @Auth(validRoles.admin)
  privateRoute3(@GetUser() user: User){
    return {
      ok: true,
      user
    }
  }
}
