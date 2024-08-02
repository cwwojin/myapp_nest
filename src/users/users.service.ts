import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUser(): string {
    return 'I am a user!';
  }
}
