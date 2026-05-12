import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateAssignmentDto } from './dtos/create-assignment.dto';
import { GetAssignmentsDto } from './dtos/get-assignments.dto';
import { ReviewAssignmentSubmissionDto } from './dtos/review-assignment-submission.dto';
import { SubmitAssignmentDto } from './dtos/submit-assignment.dto';
import { UpdateAssignmentDto } from './dtos/update-assignment.dto';
import { AssignmentsService } from './providers/assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  findAll(@Query() query: GetAssignmentsDto, @ActiveUser() user: ActiveUserData) {
    return this.assignmentsService.findAll(query, user);
  }

  @Get('my')
  findMyAssignments(@ActiveUser() user: ActiveUserData) {
    return this.assignmentsService.findLearnerAssignments(user);
  }

  @Get('submissions')
  findSubmissions(@ActiveUser() user: ActiveUserData) {
    return this.assignmentsService.findSubmissions(user);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.assignmentsService.findById(id, user);
  }

  @Post()
  create(@Body() dto: CreateAssignmentDto, @ActiveUser() user: ActiveUserData) {
    return this.assignmentsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.assignmentsService.update(id, dto, user);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.assignmentsService.delete(id, user);
  }

  @Post(':id/submissions')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitAssignmentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.assignmentsService.submit(id, dto, user);
  }

  @Patch('submissions/:id/review')
  reviewSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewAssignmentSubmissionDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.assignmentsService.reviewSubmission(id, dto, user);
  }
}
