import { PrismaService } from '../prisma/prisma.service.js';
declare class CreateReviewDto {
    interestId: string;
    rating: number;
    comment?: string;
}
export declare class ReviewsController {
    private prisma;
    constructor(prisma: PrismaService);
    create(authorId: string, dto: CreateReviewDto): Promise<{
        author: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        interestId: string;
        rating: number;
        comment: string | null;
        authorId: string;
        targetId: string;
    }>;
    findForUser(userId: string): Promise<{
        reviews: ({
            author: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            interestId: string;
            rating: number;
            comment: string | null;
            authorId: string;
            targetId: string;
        })[];
        averageRating: number | null;
        totalReviews: number;
    }>;
}
export {};
