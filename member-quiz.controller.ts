import { ApiUseTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, HttpStatus, ParseIntPipe, Param, BadRequestException } from '@nestjs/common';
import { ApiControllerTags } from '../common/swagger';
import { StoreDetail } from '../common/decorators/store-detail.decorator';
import { StoreDetailDto } from '../common/dto/store-detail.dto';
import { HeadersDto } from '../common/dto/headers-info.dto';
import { HeadersInfo } from '../common/decorators/headers-info.decorator';
import { MemberQuizAnswersDto } from '../quiz/dto';
import { QuizService } from '../quiz/quiz.service';

@ApiUseTags(ApiControllerTags.MemberAccount)
@Controller('accounts/me/quiz')
export class MemberQuizController {

    constructor(private readonly quizService: QuizService) {

    }

    @Post(':id/answers')
    @HttpCode( HttpStatus.NO_CONTENT )
    @ApiOperation( { title: 'Save Member Quiz Answers', description: 'Save one or more answers to questions in a specific quiz for a logged in customer', operationId: 'saveMemberQuizAnswers' } )
    @ApiResponse( { status: HttpStatus.NO_CONTENT, description: 'Answers to questions in the quiz were successfully added/updated' } )
    @ApiResponse( { status: HttpStatus.BAD_REQUEST, description: 'No answers were supplied to submit' } )
    async saveQuizAnswers( @Param ( 'id', new ParseIntPipe() ) quizId: number, @Body() quizAnswers: MemberQuizAnswersDto, @StoreDetail() storeDetail: StoreDetailDto, @HeadersInfo() headers: HeadersDto ) {
        if ( quizAnswers.answers === undefined || quizAnswers.answers === null || quizAnswers.answers.length === 0 ) {
            throw new BadRequestException(`No answers supplied for quiz ${quizId}. At least one answer to a question is required`);
        }

        await this.quizService.saveAnswers(quizId, quizAnswers, headers);
    }
}