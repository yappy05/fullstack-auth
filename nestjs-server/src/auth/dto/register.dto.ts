import {IsString, IsEmail, MinLength, IsNotEmpty, Validate} from "class-validator";
import {IsPasswordsMatchingConstraint} from "@/libs/common/decorators/is-passwords-matching-constraint.decorator";

export class RegisterDto {
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty({ message: 'Имя не должно быть пустым' })
    name: string

    @IsNotEmpty({ message: 'Email не должен быть пустым' })
    @IsEmail({}, { message: 'Некорректный email' })
    email: string

    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
    @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
    password: string

    @IsString({ message: 'Повтор пароля должен быть строкой' })
    @IsNotEmpty({ message: 'Повтор пароля не должен быть пустым' })
    @MinLength(6, { message: 'Повтор пароля должен быть не менее 6 символов' })
    @Validate(IsPasswordsMatchingConstraint, {
        message: 'Пароли не совпадают'
    })
    passwordRepeat: string
}