import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Req,
    UnauthorizedException
} from '@nestjs/common';
import {RegisterDto} from "@/auth/dto/register.dto";
import {UserService} from "@/user/user.service";
import {$Enums, User} from "@prisma/__generated__";
import {Request, Response} from "express";
import AuthMethod = $Enums.AuthMethod;
import {LoginDto} from "@/auth/dto/login.dto";
import {verify} from "argon2";
import {ConfigService} from "@nestjs/config";
import {ProviderService} from "@/auth/provider/provider.service";
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class AuthService {
    public constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly provideService: ProviderService,
        private readonly prismaService: PrismaService
    ) {}
    public async register(req: Request, dto: RegisterDto){
        const isExists = await this.userService.findByEmail(dto.email)
        if (isExists) throw new ConflictException('Пользователь с таким email уже существует');
        const newUser = await this.userService.create(
            dto.email,
            dto.password,
            dto.name,
            '',
            AuthMethod.GRENDENTIALS,
            false
        )
        return this.saveSession(req, newUser)
    }
    public async login(req: Request, dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email)
        if (!user || !user.password) throw new NotFoundException('Пользователь не найден')
        const isValidPassword = await verify(user.password, dto.password)
        if (!isValidPassword) throw new UnauthorizedException('Неверный пароль')
        return this.saveSession(req, user)
    }

    public async extractProfileFromCode(
        req: Request,
        provider: string,
        code: string,
    ) {
        const provideInstance = this.provideService.findByService(provider)
        const profile = await provideInstance.findUserByCode(code)
        const account = await this.prismaService.account.findFirst({
            where: {
                id: profile.id,
                provider: profile.provider
            }
        })
        let user = account?.userId ? await this.userService.findById(account.userId): null
        if (user) {
            return this.saveSession(req, user)
        }
        user = await this.userService.create(
            profile.email,
            '',
            profile.name,
            profile.picture,
            AuthMethod[profile.provider.toUpperCase()],
            true
        )

        if (!account) {
            await this.prismaService.account.create({
                data: {
                    userId: user.id,
                    provider: profile.provider,
                    type: profile.provider,
                    accessToken: profile.access_token,
                    refreshToken: profile.refresh_token,
                    expiresAt: profile.expires_at ?? 0
                }
            })
        }

        return this.saveSession(req, user)
    }

    public async logout(req: Request, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err) {
                    return reject(
                        new InternalServerErrorException('Не удалось завершить сессию')
                    )
                }
                res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
                resolve()
            })
        })
    }
    private async saveSession(req: Request , user: User) {
        return new Promise((resolve, reject) => {
            req.session.userId = user.id
            req.session.save(err => {
                if(err) {
                    return reject(
                        new InternalServerErrorException('не удалось сохранить сессию')
                    )
                }
            })
            resolve({
                user
            })
        })
    }
}
