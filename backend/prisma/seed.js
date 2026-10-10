import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    await prisma.commentLike.deleteMany();
    await prisma.commentReply.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.articleView.deleteMany();
    await prisma.articleRevision.deleteMany();
    await prisma.articleAnalytics.deleteMany();
    await prisma.breakingNews.deleteMany();
    await prisma.scheduledArticle.deleteMany();
    await prisma.articleTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.media.deleteMany();
    await prisma.article.deleteMany();
    await prisma.category.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.categoryFollow.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    const adminRole = await prisma.role.create({ data: { name: UserRole.ADMIN, description: 'Platform administrator' } });
    const editorRole = await prisma.role.create({ data: { name: UserRole.EDITOR, description: 'Editorial review lead' } });
    const journalistRole = await prisma.role.create({ data: { name: UserRole.JOURNALIST, description: 'Story writer' } });
    const readerRole = await prisma.role.create({ data: { name: UserRole.READER, description: 'News reader' } });
    const adminPassword = await bcrypt.hash('admin123', 10);
    const editorPassword = await bcrypt.hash('editor123', 10);
    const journalistPassword = await bcrypt.hash('journalist123', 10);
    const readerPassword = await bcrypt.hash('reader123', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@newsportal.local',
            password: adminPassword,
            bio: 'System administrator managing platform operations.',
            roleId: adminRole.id,
            isEmailVerified: true,
        },
    });
    const editor = await prisma.user.create({
        data: {
            name: 'Asha Nair',
            email: 'editor@newsportal.local',
            password: editorPassword,
            bio: 'Senior editor on policy and regional coverage.',
            roleId: editorRole.id,
            isEmailVerified: true,
        },
    });
    const journalist1 = await prisma.user.create({
        data: {
            name: 'Rohan Menon',
            email: 'rohan@newsportal.local',
            password: journalistPassword,
            bio: 'Technology and innovation reporter.',
            roleId: journalistRole.id,
            isEmailVerified: true,
        },
    });
    const journalist2 = await prisma.user.create({
        data: {
            name: 'Meera Iyer',
            email: 'meera@newsportal.local',
            password: journalistPassword,
            bio: 'Business and finance specialist.',
            roleId: journalistRole.id,
            isEmailVerified: true,
        },
    });
    const reader1 = await prisma.user.create({
        data: {
            name: 'Karthik S',
            email: 'reader1@newsportal.local',
            password: readerPassword,
            bio: 'Interested in science and technology.',
            roleId: readerRole.id,
            isEmailVerified: true,
        },
    });
    const reader2 = await prisma.user.create({
        data: {
            name: 'Priya V',
            email: 'reader2@newsportal.local',
            password: readerPassword,
            bio: 'Covers local and community stories.',
            roleId: readerRole.id,
            isEmailVerified: true,
        },
    });
    const categories = ['Technology', 'Business', 'Sports', 'Politics', 'Entertainment', 'Science', 'Health', 'Education', 'World', 'India', 'Tamil Nadu'];
    const categoryRecords = await Promise.all(categories.map((name) => prisma.category.create({ data: { name, slug: name.toLowerCase().replace(/\s+/g, '-'), description: `${name} coverage and analysis.` } })));
    const tagNames = ['AI', 'India', 'Startups', 'Climate', 'Markets', 'Policy', 'Health', 'Sport', 'Innovation'];
    const tags = await Promise.all(tagNames.map((name) => prisma.tag.create({ data: { name } })));
    const articlesData = [
        { title: 'AI infrastructure boom expected to reshape India’s digital economy', slug: 'ai-infrastructure-boom-to-reshape-india-digital-economy', subtitle: 'New data-center and cloud investments are accelerating adoption across sectors.', excerpt: 'The surge in semiconductor and cloud spending is redefining enterprise technology investments in India.', content: 'India is witnessing a rapid jump in artificial intelligence investments and data-center spending.', category: 'Technology', author: journalist1, status: ArticleStatus.PUBLISHED, featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475', isBreaking: true, isFeatured: true, viewCount: 5620, likeCount: 420, commentCount: 53, shareCount: 120, bookmarkCount: 90, tags: ['AI', 'Innovation'] },
        { title: 'Budget roadmaps signal faster public-private investment in clean energy', slug: 'budget-roadmaps-faster-public-private-investment-clean-energy', subtitle: 'Policy levers are pushing utility-scale projects and battery storage', excerpt: 'Energy transition projects are seeing fresh commitment from both government and private capital.', content: 'Clean-energy project pipelines are expanding with new incentives for transmission, solar and grid modernization.', category: 'Business', author: journalist2, status: ArticleStatus.PUBLISHED, featuredImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9', viewCount: 4890, likeCount: 310, commentCount: 41, shareCount: 74, bookmarkCount: 68, tags: ['Markets', 'Climate'] },
        { title: 'Tamil Nadu launches new mobility corridor to ease urban commutes', slug: 'tamil-nadu-launches-new-mobility-corridor', subtitle: 'New rail and road connectivity aims to reduce congestion in major cities.', excerpt: 'State authorities say the corridor will improve regional connectivity and reduce travel times.', content: 'Officials unveiled a multi-modal transit plan designed to alleviate commuter pressure and improve access.', category: 'Tamil Nadu', author: journalist1, status: ArticleStatus.APPROVED, featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', viewCount: 3120, likeCount: 180, commentCount: 25, shareCount: 38, bookmarkCount: 54, tags: ['India'] },
        { title: 'International markets steady as investors watch central-bank guidance', slug: 'international-markets-steady-central-bank-guidance', subtitle: 'Analysts say rate expectations remain the crucial driver this week.', excerpt: 'Global stock markets are holding steady amid mixed inflation signals and policy signals.', content: 'Markets across Europe and Asia opened cautiously with investors tracking central bank positions.', category: 'World', author: journalist2, status: ArticleStatus.PUBLISHED, featuredImage: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a', viewCount: 2710, likeCount: 168, commentCount: 22, shareCount: 33, bookmarkCount: 41, tags: ['Markets'] },
        { title: 'New public health program targets early detection for chronic diseases', slug: 'public-health-program-targets-early-detection-chronic-diseases', subtitle: 'Community clinics are expected to expand screenings and digital follow-up.', excerpt: 'A statewide health effort aims to catch chronic illness earlier through simpler assessments.', content: 'Public health teams are implementing early screening pilots across district centers.', category: 'Health', author: journalist2, status: ArticleStatus.PUBLISHED, featuredImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef', viewCount: 2445, likeCount: 156, commentCount: 27, shareCount: 31, bookmarkCount: 47, tags: ['Health'] }
    ];
    for (const article of articlesData) {
        const category = categoryRecords.find((c) => c.name === article.category);
        if (!category)
            continue;
        const created = await prisma.article.create({
            data: {
                title: article.title,
                slug: article.slug,
                subtitle: article.subtitle,
                excerpt: article.excerpt,
                content: article.content,
                featuredImage: article.featuredImage,
                authorId: article.author.id,
                categoryId: category.id,
                status: article.status,
                isBreaking: article.isBreaking ?? false,
                isFeatured: article.isFeatured ?? false,
                publishedAt: article.status === ArticleStatus.PUBLISHED ? new Date() : null,
                seoTitle: article.title,
                seoDescription: article.excerpt,
                viewCount: article.viewCount,
                likeCount: article.likeCount,
                commentCount: article.commentCount,
                shareCount: article.shareCount,
                bookmarkCount: article.bookmarkCount,
            },
        });
        for (const tagName of article.tags) {
            const tag = tags.find((item) => item.name === tagName);
            if (tag) {
                await prisma.articleTag.create({ data: { articleId: created.id, tagId: tag.id } });
            }
        }
        await prisma.articleAnalytics.create({
            data: {
                articleId: created.id,
                reads: article.viewCount,
                engagement: Number((article.likeCount / Math.max(article.viewCount, 1)).toFixed(3)),
            },
        });
        if (article.isBreaking) {
            await prisma.breakingNews.create({ data: { articleId: created.id } });
        }
    }
    const articleId = (await prisma.article.findUnique({ where: { slug: 'ai-infrastructure-boom-to-reshape-india-digital-economy' } })).id;
    const reviewArticleId = (await prisma.article.findUnique({ where: { slug: 'budget-roadmaps-faster-public-private-investment-clean-energy' } })).id;
    const healthArticleId = (await prisma.article.findUnique({ where: { slug: 'public-health-program-targets-early-detection-chronic-diseases' } })).id;
    await prisma.comment.create({
        data: { articleId, userId: reader1.id, content: 'This is a promising trend. The adoption story is becoming tangible for enterprise customers.' },
    });
    await prisma.bookmark.create({ data: { articleId: reviewArticleId, userId: reader2.id } });
    await prisma.like.create({ data: { articleId: healthArticleId, userId: reader1.id } });
    await prisma.notification.create({
        data: {
            userId: journalist1.id,
            type: 'ARTICLE_APPROVED',
            message: 'Your article was approved and is now live.',
            link: '/articles/ai-infrastructure-boom-to-reshape-india-digital-economy',
        },
    });
}
main()
    .then(() => console.log('Seed complete'))
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
