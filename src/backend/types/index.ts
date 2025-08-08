export interface FileMetadata {
    id: string;
    name: string;
    size: number; // in bytes
    type: string; // MIME type
    uploadedAt: Date;
    ownerId: string; // User ID of the uploader
}

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}