import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, LoginEmailDto } from '../../dtos/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SUtils } from '../../shared/utils';
import { UserType } from '../../enums/user-type.enum';
import { AbstractService } from '../../generic/abstract.service';
import { paginate } from 'nestjs-typeorm-paginate';
// import { I18nContext } from 'nestjs-i18n';
import axios from 'axios';

@Injectable()
export class UserService extends AbstractService<User> {

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super(userRepo)
  }

  async onModuleInit() {
    const adminsCount = await this.userRepo.count({ where: { email: 'admin@gmail.com' } })
    // const role = await this.roleService.repository.findOneBy({ name: 'Admin' })

    if (adminsCount === 0) {
      const newAdmin: Partial<User> = {
        email: 'admin@gmail.com',
        password: '123456789',
        isActive: true,
        profileImage: '',
        otp: '',
        haveAccount: true,
        userType: UserType.ADMIN,
        verifiedOtp: true,
        firstTime: false,
      }
      await this.create(newAdmin as User)
    }
  }

  async create(createUserDto: CreateUserDto | User) {
    try {
      let user: User = Object.assign(new User(), createUserDto);
      // let newRole = await this.getOrCreateRole(createUserDto.role);
      // user.role = { id: newRole.id } as Role;
      user.haveAccount = true;
      user.userType = UserType.ADMIN;
      user.firstTime = false;

      const createdUser = await this.userRepo.save(user as User);
      return await this.findObjectById(createdUser.id);
    } catch (error) {
      if (error.code === '23505') {
        let errorMessage: string;
        if (error.detail.includes('email')) {
          // errorMessage = 'Email already exists.';
          throw new HttpException('This email used before', HttpStatus.BAD_REQUEST);
        }
        else if (error.detail.includes('mobile')) {
          errorMessage = 'Mobile number already exists.';
          // throw new HttpException('This email used before', HttpStatus.BAD_REQUEST);
        } else {
          errorMessage = 'Duplicate key value violates unique constraint.';
        }
        // throw new HttpException(errorMessage, HttpStatus.CONFLICT);
      }
    }
  }

  async findOne(id: number) {
    return await this.userRepo.findOne({ where: { id } });
  }

  // private async getOrCreateRole(roleDto: Role | number): Promise<Role> {
  //   if (typeof roleDto === 'number') {
  //     return this.roleService.findOneBy({ id: roleDto });
  //   } else {
  //     return this.roleService.save(roleDto);
  //   }
  // }


  async findUser(email: string): Promise<User | PromiseLike<User>> {
    let existsUser = await this.userRepo.findOne(
      {
        where: { email: email }, select: ['email', 'password', 'id', 'createdAt', 'updatedAt', 'isActive', 'profileImage', 'userType'],
      },);

    if (!existsUser) {
      throw new UnauthorizedException('Check your credentials');
    }

    //remove password from response
    // delete existsUser.password
    return existsUser;
  }

  async sendOtp(body: LoginEmailDto) {
    let user = await this.userRepo.findOne({
      where: { email: body.email }
    })
    if (!user) {
      user = this.userRepo.create(body)
    }

    // Generate OTP and update user record
    const otp = SUtils.generateOtp(6);
    user.otp = "1221";
    user.password = null;

    return await this.userRepo.save(user);
  }

  async filterUsers(type?: string, page?: number, pageSize?: number) {
    let queryBuilder = this.userRepo.createQueryBuilder('p');

    // Add where clause only if type is provided
    if (type) {
      queryBuilder = queryBuilder.where('p.userType = :userType', { userType: type });
    }

    // Always order by updatedAt
    queryBuilder.orderBy('p.updatedAt', 'DESC');

    // Apply pagination if page and pageSize are provided
    if (page && pageSize) {
      return paginate<User>(queryBuilder, { page, limit: pageSize });
    } else {
      // Return all users if pagination parameters are not provided
      return queryBuilder.getMany();
    }
  }


  async updateUser(id, body) {
    try {
      let existsRecord = await this.findOneBy({ id: id });
      body.updatedAt = new Date();
      existsRecord.firstTime = false;
      existsRecord.isActive = true;
      existsRecord = Object.assign(existsRecord, body)
      // User.merge(existsRecord, body);
      let updateResult = await this.save(existsRecord);
      return existsRecord;
    }

    catch (error) {
      if (error.code === '23505') {
        let errorMessage: string;
        if (error.detail.includes('email')) {
          errorMessage = 'Email already exists.';
        } else if (error.detail.includes('mobile')) {
          errorMessage = 'Mobile number already exists.';
        } else {
          errorMessage = 'Duplicate key value violates unique constraint.';
        }
        throw new HttpException(errorMessage, HttpStatus.CONFLICT);
      }
    }
  }

  async deleteUser(id: number) {
    try {
      const API_KEY = process.env.AYRSHARE_API_KEY;
      const user = await User.findOneBy({ id: id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const PROFILE_KEY = user.profileKey;
  
      const url = 'https://app.ayrshare.com/api/profiles';
  
      const response = await axios.delete(`${url}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Profile-Key': PROFILE_KEY
        }
      });
  
      console.log('Response:', response.data);
      await this.repository.delete(id);
  
      return response.data;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error);
      let errorMessage = error.response.data;
      let statusCode = HttpStatus.BAD_REQUEST;
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      throw new HttpException(errorMessage, statusCode);
    }
  }
}