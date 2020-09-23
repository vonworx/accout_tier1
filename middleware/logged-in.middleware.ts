import { MemberService } from '../_services/member.service';
import { Logger } from '../../common/logging/log.service';
import { NestMiddleware, MiddlewareFunction, Inject, UnauthorizedException, Injectable} from '@nestjs/common';
import { SessionInfoDto, SessionAuthType } from '../../common/dto/session-info.dto';
import { HeadersDto } from '../../common/dto/headers-info.dto';

@Injectable()
export class LoggedInMiddleware implements NestMiddleware {

    constructor ( @Inject( Logger.getToken() ) private readonly logger: Logger, private readonly memberService: MemberService ) {

    }

    resolve ( ...args: any[] ): MiddlewareFunction {

        const authFlags = Array.isArray( args ) && args.length > 0 ? parseInt( args[0] ) : SessionAuthType.CREDS;

        if ( isNaN( authFlags ) ) {
            throw new Error('LoggedInMiddleware authFlags must be an integer');
        }

        return async ( req, res, next ) => {

            const sessionInfo: SessionInfoDto = req.sessionInfo;
            const headers: HeadersDto = req.headersInfo || new HeadersDto();

            if ( !sessionInfo.matchesAuthType( authFlags ) ) {
                throw new UnauthorizedException( 'Session does not have appropriate authorization type' );
            }

            const loggedIn = await this.memberService.validateUser( sessionInfo, headers );

            if ( loggedIn ) {
                next();
            } else {
                throw new UnauthorizedException( 'User is not authenticated and needs to login' );
            }
        };
    }
}
