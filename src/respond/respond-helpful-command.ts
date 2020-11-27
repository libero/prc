import {
  DomainEvent,
  UserFoundReviewHelpfulEvent,
  UserRevokedFindingReviewNotHelpfulEvent,
} from '../types/domain-events';
import { generate } from '../types/event-id';
import { ReviewId } from '../types/review-id';
import { UserId } from '../types/user-id';

export type GetAllEvents = () => Promise<ReadonlyArray<DomainEvent>>;

type RespondHelpful = (userId: UserId, reviewId: ReviewId) =>
Promise<ReadonlyArray<UserFoundReviewHelpfulEvent | UserRevokedFindingReviewNotHelpfulEvent>>;

export const respondHelpful = (currentResponse: 'helpful' | 'not-helpful' | 'none'): RespondHelpful => async (userId, reviewId) => {
  switch (currentResponse) {
    case 'none':
      return [
        {
          id: generate(),
          type: 'UserFoundReviewHelpful',
          date: new Date(),
          userId,
          reviewId,
        },
      ];
    case 'helpful':
      return [];
    case 'not-helpful':
      return [
        {
          id: generate(),
          type: 'UserRevokedFindingReviewNotHelpful',
          date: new Date(),
          userId,
          reviewId,
        },
        {
          id: generate(),
          type: 'UserFoundReviewHelpful',
          date: new Date(),
          userId,
          reviewId,
        },
      ];
  }
};
