import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from '../lecture.entity';
import { Repository } from 'typeorm';
import { PatchLectureDto } from '../dtos/patch-lecture.dto';
import { Chapter } from 'src/chapters/chapter.entity';

@Injectable()
export class UpdateLectureProvider {
  constructor(
    /**
     * Inject lectureRepository
     */
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,

    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async update(id: number, patchLectureDto: PatchLectureDto): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({
      where: { id },
      relations: ['chapter', 'video', 'attachments'],
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    const { chapterId, videoId, isPublished, ...rest } = patchLectureDto;

    // normal fields update
    Object.assign(lecture, rest);

    // course relation handling
    if (chapterId !== undefined) {
      lecture.chapter = { id: chapterId } as Lecture['chapter'];
    }

    // video relation handling
    if (videoId !== undefined) {
      lecture.video = videoId ? ({ id: videoId } as Lecture['video']) : null;
    }

    /**
     * 🔥 PUBLISH VALIDATION
     */
    if (isPublished !== undefined) {
      // 🔥 check content
      const hasVideo = lecture.video?.id;

      const hasAttachments =
        lecture.attachments && lecture.attachments.length > 0;

      if (isPublished && !hasVideo && !hasAttachments) {
        throw new BadRequestException(
          'Lecture must have a video or at least one attachment to be published',
        );
      }

      lecture.isPublished = isPublished;

      if (lecture.chapter?.id) {
        const chapter = await this.chapterRepository.findOne({
          where: { id: lecture.chapter.id },
          relations: ['lectures'],
        });

        if (chapter) {
          const hasPublishedLecture = chapter.lectures.some((l) =>
            l.id === lecture.id
              ? isPublished // current updating lecture
              : l.isPublished,
          );

          // 🔥 auto unpublish chapter
          if (!hasPublishedLecture && chapter.isPublished) {
            chapter.isPublished = false;

            await this.chapterRepository.save(chapter);
          }
        }
      }
    }

    return await this.lectureRepository.save(lecture);
  }
}
