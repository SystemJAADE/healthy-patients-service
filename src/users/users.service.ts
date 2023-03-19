import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async create(user: UserDto): Promise<User> {
    const createdUser = this.usersRepository.create(user);
    return this.usersRepository.save(createdUser);
  }

  public async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public async findByID(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  public async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  public async update(id: string, user: UserDto): Promise<User> {
    await this.usersRepository.update(id, user);
    return await this.usersRepository.findOneBy({ id });
  }

  public async delete(id: number) {
    return this.usersRepository.delete(id);
  }
}
