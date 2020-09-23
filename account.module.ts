import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AccountController } from './account.controller';
import { LoggingMiddleware } from '../common/middlewares/logger.middleware';
import { StoreInfoMiddleware } from '../common/middlewares/store-info.middleware';
import { CommonModule } from '../common/common.module';
import { LoggedInMiddleware } from './middleware/logged-in.middleware';
import { SessionValidationMiddleware } from '../common/middlewares/session-validation.middleware';
import { createRequestId } from '../common/middlewares/request-id.middleware';
import { MembershipController } from './membership.controller';
import { QuizModule } from '../quiz/quiz.module';
import { MemberQuizController } from './member-quiz.controller';
import { SessionAuthType } from '../common/dto/session-info.dto';
import {ApiKeysValidationMiddleware} from '../common/middlewares/api-keys-validation.middleware';

@Module({
    imports: [CommonModule, QuizModule],
    controllers: [AccountController, MembershipController, MemberQuizController]
})
export class AccountModule implements NestModule {

    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggingMiddleware, createRequestId(), StoreInfoMiddleware, ApiKeysValidationMiddleware, SessionValidationMiddleware).forRoutes(
            AccountController,
            MembershipController,
            MemberQuizController
        );

        //Create, Update, Delete require credentials
        //Note: because there are post in both location getting unique settings, you have to expand the greedy statement
        consumer.apply(LoggedInMiddleware)
            .with(SessionAuthType.CREDS)
            .forRoutes(
                {path: 'accounts/me/profile', method: RequestMethod.POST},
                {path: 'accounts/me/addresses', method: RequestMethod.POST},
                {path: 'accounts/me/address/verify', method: RequestMethod.POST},
                {path: 'accounts/me/addresses/:id', method: RequestMethod.POST},
                {path: 'accounts/me/orders/:id/rmas', method: RequestMethod.POST},
                {path: 'accounts/me/products/:id/images', method: RequestMethod.POST},
                {path: 'accounts/me/reviews', method: RequestMethod.POST},
                {path: 'accounts/me/payments/ideal', method: RequestMethod.POST},
                {path: 'accounts/me/payments/sepa', method: RequestMethod.POST},
                {path: 'accounts/me/payments/adyen', method: RequestMethod.POST},
                {path: 'accounts/me/payments/adyen/session', method: RequestMethod.POST},
                {path: 'accounts/me/payments', method: RequestMethod.POST},
                {path: 'accounts/me/reset', method: RequestMethod.POST},
                {path: 'accounts/me/preferences/email', method: RequestMethod.POST},
                {path: 'accounts/me/detail', method: RequestMethod.POST},
                {path: 'accounts/me/*', method: RequestMethod.PATCH},
                {path: 'accounts/me/*', method: RequestMethod.PUT},
                {path: 'accounts/me/*', method: RequestMethod.DELETE},
                {path: 'accounts/me/membership/status', method: RequestMethod.POST }
            );

        // Reads are fine with AutoLogin or Credentials
        // Writes to add a wish list product or wait list product are also fine with AutoLogin or Credentials
        consumer.apply(LoggedInMiddleware)
            .with(SessionAuthType.AUTOLOGIN | SessionAuthType.CREDS)
            .forRoutes(
                {path: 'accounts/me/*', method: RequestMethod.GET},
                {path: 'accounts/me/wishlist', method: RequestMethod.POST},
                {path: 'accounts/me/waitlist', method: RequestMethod.POST},
                {path: 'accounts/me/waitlist/sets', method: RequestMethod.POST},
                {path: 'accounts/me/tokens', method: RequestMethod.GET}
            );
    }
}
