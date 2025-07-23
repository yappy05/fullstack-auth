import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";
import {$Enums, User} from "@prisma/__generated__";
import AuthMethod = $Enums.AuthMethod;
import {hash} from "argon2"

@Injectable()
export class UserService {
    public constructor(private readonly prismaService: PrismaService) {
    }

    public async findById(id: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id
            },
            include: {
                accounts: true,
            }
        })
        if (!user) throw new NotFoundException('пользователь не найден. Пожалуйста, проверьте введеные данные.')
        return user
    }

    public async findByEmail(email: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
            include: {
                accounts: true,
            }
        })
        if (!user) throw new NotFoundException('пользователь не найден. Пожалуйста, проверьте введеные данные.')
        return user
    }

    public async create(email: string, password: string, displayName: string, picture: string, method: AuthMethod, isVerified: boolean) {
        const user = await this.prismaService.user.create({
            data: {
                email,
                password: password ? await hash(password) : '',
                displayName,
                picture,
                method,
                isVerified
            },
            include: {
                accounts: true,
            }
        })
        return user
    }
}
