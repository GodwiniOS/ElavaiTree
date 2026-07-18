import { FamilyData } from '@/types';

export const MOCK_FAMILY_DATA: FamilyData = {
  settings: {
    familyName: 'Yagappa Nadar Family',
    village: 'Thanjavur',
    familyId: 'viyagappa',
    version: '1.0',
    driveFolderId: 'mock-folder-id'
  },
  members: [
    {
      memberId: 'yagappa_nadar',
      firstName: 'Yagappa',
      lastName: 'Nadar',
      displayName: 'A. Yagappa Nadar',
      gender: 'Male',
      dob: '1880-08-15',
      dod: '1955-03-20',
      alive: 'No',
      photoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop',
      occupation: 'Merchant & Community Elder',
      education: 'Thanjavur School of Commerce',
      location: 'Thanjavur',
      biographyDocId: 'mock-yagappa-doc',
      status: 'Ancestor'
    },
    {
      memberId: 'gnanammal',
      firstName: 'Gnanammal',
      lastName: 'Nadar',
      displayName: 'Gnanammal Nadar',
      gender: 'Female',
      dob: '1885-09-10',
      dod: '1960-04-12',
      alive: 'No',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
      occupation: 'Homemaker',
      location: 'Thanjavur',
      biographyDocId: 'mock-gnanammal-doc',
      status: 'Ancestor Spouse'
    },
    {
      memberId: 'idhayameri_ammal',
      firstName: 'Idhayameri',
      lastName: 'Ammal',
      displayName: 'Idhayameri Ammal',
      gender: 'Female',
      dob: '1907-05-12',
      dod: '1989-11-04',
      alive: 'No',
      fatherId: 'yagappa_nadar',
      motherId: 'gnanammal',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
      occupation: 'Teacher',
      location: 'Thanjavur',
      biographyDocId: 'mock-idhayameri-doc',
      status: 'Elder Sister'
    },
    {
      memberId: 'arulanthasamy_nadar',
      firstName: 'Arulanthasamy',
      lastName: 'Nadar',
      displayName: 'A. Y. Arulanthasamy Nadar',
      gender: 'Male',
      dob: '1905-02-14',
      dod: '1978-08-30',
      alive: 'No',
      fatherId: 'yagappa_nadar',
      motherId: 'gnanammal',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      occupation: 'Merchant',
      location: 'Thanjavur',
      biographyDocId: 'mock-arulanthasamy-doc',
      status: 'Elder Brother'
    },
    {
      memberId: 'parisutha_nadar',
      firstName: 'Parisutha',
      lastName: 'Nadar',
      displayName: 'A. Y. S. Parisutha Nadar',
      gender: 'Male',
      dob: '1909-04-13',
      dod: '1985-05-14',
      alive: 'No',
      fatherId: 'yagappa_nadar',
      motherId: 'gnanammal',
      spouseId: 'philomena_soosaiammal',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
      occupation: 'Mayor of Thanjavur & Politician',
      education: 'St. Joseph\'s College, Tiruchirappalli',
      location: 'Thanjavur',
      biographyDocId: 'mock-parisutha-doc',
      status: 'Younger Brother'
    },
    {
      memberId: 'philomena_soosaiammal',
      firstName: 'Philomena',
      lastName: 'Soosaiammal',
      displayName: 'Philomena Soosaiammal',
      gender: 'Female',
      dob: '1915-09-18',
      dod: '1998-04-10',
      alive: 'No',
      spouseId: 'parisutha_nadar',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
      occupation: 'Homemaker & Philanthropist',
      location: 'Thanjavur',
      status: 'Spouse'
    },
    {
      memberId: 'selvaraj',
      firstName: 'Selvaraj',
      lastName: 'Nadar',
      displayName: 'S. P. Selvaraj',
      gender: 'Male',
      dob: '1942-03-20',
      alive: 'Yes',
      fatherId: 'parisutha_nadar',
      motherId: 'philomena_soosaiammal',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
      occupation: 'Managing Director, Hotel Gnanam',
      location: 'Thanjavur',
      status: 'Son'
    },
    {
      memberId: 'anthonisamy',
      firstName: 'Anthonisamy',
      lastName: 'Nadar',
      displayName: 'S. P. Anthonisamy',
      gender: 'Male',
      dob: '1945-11-20',
      alive: 'Yes',
      fatherId: 'parisutha_nadar',
      motherId: 'philomena_soosaiammal',
      photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=300&auto=format&fit=crop',
      occupation: 'Chairman, PIT Science Institute',
      location: 'Thanjavur',
      status: 'Son'
    }
  ],
  relationships: [
    { fromId: 'yagappa_nadar', relationType: 'Father', toId: 'idhayameri_ammal' },
    { fromId: 'yagappa_nadar', relationType: 'Father', toId: 'arulanthasamy_nadar' },
    { fromId: 'yagappa_nadar', relationType: 'Father', toId: 'parisutha_nadar' },
    { fromId: 'gnanammal', relationType: 'Mother', toId: 'idhayameri_ammal' },
    { fromId: 'gnanammal', relationType: 'Mother', toId: 'arulanthasamy_nadar' },
    { fromId: 'gnanammal', relationType: 'Mother', toId: 'parisutha_nadar' },
    { fromId: 'parisutha_nadar', relationType: 'Father', toId: 'selvaraj' },
    { fromId: 'parisutha_nadar', relationType: 'Father', toId: 'anthonisamy' },
    { fromId: 'philomena_soosaiammal', relationType: 'Mother', toId: 'selvaraj' },
    { fromId: 'philomena_soosaiammal', relationType: 'Mother', toId: 'anthonisamy' }
  ],
  events: [
    {
      eventId: 'evt_wedding_parisutha',
      title: 'Wedding of A. Y. S. Parisutha Nadar',
      description: 'The marriage celebration of A. Y. S. Parisutha Nadar and Philomena Soosaiammal at Sacred Heart Cathedral, Thanjavur.',
      date: '1938-05-15',
      location: 'Sacred Heart Cathedral, Thanjavur',
      members: 'parisutha_nadar,philomena_soosaiammal,yagappa_nadar'
    },
    {
      eventId: 'evt_mayor_inaugural',
      title: 'Inauguration as Mayor of Thanjavur',
      description: 'A. Y. S. Parisutha Nadar inaugurates his term as Mayor of Thanjavur Municipality, focusing on civic upgrades and public health.',
      date: '1959-11-01',
      location: 'Municipal Office, Thanjavur',
      members: 'parisutha_nadar,idhayameri_ammal'
    }
  ],
  stories: [
    {
      storyId: 'story_thanjavur_heritage',
      title: 'The Thanjavur Roots: Building a Legacy',
      googleDocId: 'mock-legacy-story-doc',
      author: 'Idhayameri Ammal',
      createdDate: '1980-04-10',
      tags: 'history, Thanjavur, lineage'
    }
  ],
  documents: [
    {
      documentId: 'doc_birth_parisutha',
      name: 'Birth Certificate of A. Y. S. Parisutha Nadar',
      googleDriveUrl: 'https://drive.google.com/open?id=mock-birth-cert',
      owner: 'parisutha_nadar',
      category: 'Birth Certificate'
    }
  ],
  photos: [
    {
      photoId: 'photo_family_gathering',
      memberId: 'parisutha_nadar',
      driveImageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop',
      caption: 'A. Y. S. Parisutha Nadar during a family reunion banquet'
    }
  ],
  places: [
    {
      placeId: 'place_thanjavur',
      name: 'Thanjavur Ancestral Home',
      latitude: 10.7870,
      longitude: 79.1378,
      description: 'The ancestral estate where Yagappa Nadar raised his children.'
    }
  ]
};

export const MOCK_DOCS: Record<string, string> = {
  'mock-yagappa-doc': `
    <h1>A. Yagappa Nadar</h1>
    <p>A. Yagappa Nadar was the patriarch of the family. Born in August 1880, he established a thriving mercantile business and was widely respected as a community elder and philanthropist in Thanjavur.</p>
  `,
  'mock-gnanammal-doc': `
    <h1>Gnanammal Nadar</h1>
    <p>Gnanammal Nadar was the matriarch of the family and wife of A. Yagappa Nadar. She raised three children and supported various parish charity guilds in Thanjavur.</p>
  `,
  'mock-idhayameri-doc': `
    <h1>Idhayameri Ammal</h1>
    <p>Idhayameri Ammal was the daughter of Yagappa Nadar and Gnanammal. She was a dedicated teacher and local community education organizer in Thanjavur.</p>
  `,
  'mock-arulanthasamy-doc': `
    <h1>A. Y. Arulanthasamy Nadar</h1>
    <p>A. Y. Arulanthasamy Nadar was the eldest son of Yagappa Nadar. He managed the family commercial networks and was known for supporting regional youth athletic clubs.</p>
  `,
  'mock-parisutha-doc': `
    <h1>A. Y. S. Parisutha Nadar</h1>
    <p><strong>A. Y. S. Parisutha Nadar</strong> (13 April 1909 – 14 May 1985) was an Indian politician, educationist, and community leader from Thanjavur, Tamil Nadu.</p>
    <h2>Early Life & Family Background</h2>
    <p>He was born into a Roman Catholic Nadar family to parents A. Yagappa Nadar and Gnanammal. He was the youngest of three siblings.</p>
    <h2>Political Career</h2>
    <p>He served as a member of the legislative assembly (MLA) for the Thanjavur constituency, winning elections in 1946, 1957, and 1967 representing the Indian National Congress. He served as the Thanjavur Town Congress President for 21 years.</p>
    <h2>Civic Leadership</h2>
    <p>He was the Chairman of the Thanjavur Municipality from 1959 to 1961, implementing the Thirumanur drinking water scheme.</p>
    <h2>Philanthropy & Legacy</h2>
    <p>He spearheaded the establishment of the Thanjavur Medical College and his family donated prime lands for the Rajah Serfoji Government College.</p>
    <h2>Aviation & Sports Interests</h2>
    <p>He played football for the Madras State team. Remarkably, at the age of 61, he obtained a pilot's license and flew solo.</p>
  `,
  'mock-legacy-story-doc': `
    <h1>The Thanjavur Roots: Building a Legacy</h1>
    <p>This story details the historical path of the family from merchants to prominent politicians and professionals. It documents the guidance of Yagappa Nadar and how his children pursued public welfare.</p>
  `
};
