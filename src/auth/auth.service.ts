import {  BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositoy: Repository<User>
  ){}
  
  async create(createUserDto: CreateUserDto) {

    try {
        const user = this.userRepositoy.create(createUserDto)
        await this.userRepositoy.save(user)
        return user
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  private handleDBErrors (error: any): never{
    if (error.code === "23505") throw new BadRequestException(error.detail)

    console.log(error)

    throw new InternalServerErrorException("Please check server logs")
  }
}
