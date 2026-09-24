import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositoy: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepositoy.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepositoy.save(user);

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.userRepositoy.findOne({
        where: { email },
        select: { email: true, password: true },
      });

      if (!user)
        throw new UnauthorizedException('Credentials are not valid (email)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credentials are not valid (password)');

      return user;
      // Todo: Retornar el JWT
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
