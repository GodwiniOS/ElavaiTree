export interface FamilySettings {
  familyName: string;
  village: string;
  familyId: string;
  version: string;
  driveFolderId: string;
}

export interface Member {
  memberId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string; // YYYY-MM-DD
  dod?: string; // YYYY-MM-DD
  alive: 'Yes' | 'No';
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  photoUrl?: string;
  occupation?: string;
  education?: string;
  location?: string;
  biographyDocId?: string;
  status?: string;
}

export interface Relationship {
  fromId: string;
  relationType: 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Uncle' | 'Aunt' | 'Grandfather' | 'Grandmother' | 'Cousin' | string;
  toId: string;
}

export interface FamilyEvent {
  eventId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  location: string;
  members: string; // Comma separated MemberIDs
  photoFolderId?: string;
}

export interface Story {
  storyId: string;
  title: string;
  googleDocId: string;
  author: string;
  createdDate: string;
  tags: string; // Comma separated
}

export interface Document {
  documentId: string;
  name: string;
  googleDriveUrl: string;
  owner: string; // MemberID
  category: string; // e.g. Birth Certificate, Marriage Certificate
}

export interface Photo {
  photoId: string;
  memberId: string;
  driveImageUrl: string;
  caption: string;
}

export interface Place {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface FamilyData {
  settings: FamilySettings;
  members: Member[];
  relationships: Relationship[];
  events: FamilyEvent[];
  stories: Story[];
  documents: Document[];
  photos: Photo[];
  places: Place[];
}
