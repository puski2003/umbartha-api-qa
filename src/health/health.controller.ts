import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.database.pingCheck('mongoDB')]);
  }
}
