export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface SharedFile {
    file: FileMetadata;
    sharedWith: User[];
    sharedAt: Date;
}