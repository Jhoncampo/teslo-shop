import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'seed executed' })
  executedSeed() {
    return this.seedService.runSeed();
  }
}
