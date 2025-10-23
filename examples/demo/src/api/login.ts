import { IsNotEmpty, Length } from 'class-validator';
import { IApi, LogFactoryBase, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { Api } = decorator;

class LoginRequestBody {
    @Length(4, 20)
    public username: string;
    @IsNotEmpty()
    public password: string;
}


@Api({ route: '/login', method: 'POST', validateType: LoginRequestBody })
@Service()
export class LoginApi implements IApi {

    @Inject()
    public logFactory: LogFactoryBase;

    public async call(ctx: RouterContext<LoginRequestBody>) {
        const body = ctx.request.body;
        console.log(body);
        return 'login success';
    }
}
