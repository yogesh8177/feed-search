import { SocialMedia } from './SocialMedia'; 

export class Blog {
    title: string;
    excerpt: string;
    content: string;
    author: Author;
    createdAt: Date;
    updatedAt: Date;
}

class Author {
    firstName: string;
    lastName: string;
    email: string;
    socialMedia: SocialMedia;
    bio: any
}
