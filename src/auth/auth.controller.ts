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
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 200,
    description: 'User registred',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    example: {
      id: 'aec5317a-1a1a-42b9-908c-ebd05e67b3ec',
      email: 'jhon@gmail.com',
      password: '$2b$10$bQX1pXpfUnxwb/n1ZJHxUellD5c5feCM6NEq7UeM2ZJY9Gf/THf0u',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlYzUzMTdhLTFhMWEtNDJiOS05MDhjLWViZDA1ZTY3YjNlYyIsImlhdCI6MTc5MDg3NjE4MCwiZXhwIjoxNzkwODgzMzgwfQ.RRXjzM_Nr0EnuTsbLWNcRQLfiqe86fhnRN6H634tIiI',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  @ApiResponse({
    status: 200,
    example: {
      id: 'aec5317a-1a1a-42b9-908c-ebd05e67b3ec',
      email: 'jhon@gmail.com',
      fullName: "Jhon Eduard Campo",
      password: '$2b$10$bQX1pXpfUnxwb/n1ZJHxUellD5c5feCM6NEq7UeM2ZJY9Gf/THf0u',
      roles: ['admin'],
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlYzUzMTdhLTFhMWEtNDJiOS05MDhjLWViZDA1ZTY3YjNlYyIsImlhdCI6MTc5MDg3NjE4MCwiZXhwIjoxNzkwODgzMzgwfQ.RRXjzM_Nr0EnuTsbLWNcRQLfiqe86fhnRN6H634tIiI',
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      email,
      rawHeaders,
    };
  }

  //@SetMetadata("roles", ["admin", "super-user"])
  @Get('private2')
  @RoleProtected(validRoles.superUser, validRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(validRoles.admin)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
