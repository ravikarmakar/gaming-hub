export interface Member {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
}

export interface Organizer {
    _id?: string;
    ownerId: string;
    name: string;
    imageUrl: string;
    bannerUrl: string;
    description: string;
    email: string;
    members: Member[];
    isVerified: boolean;
    isHiring: boolean;
    tag: string;
    socialLinks?: {
        discord?: string;
        twitter?: string;
        website?: string;
        instagram?: string;
        youtube?: string;
    };
    createdAt: string;
    updatedAt: string;
}