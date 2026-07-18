import { FamilyData, Member, Relationship, FamilySettings } from '@/types';

export function parseDocToFamilyData(docHtml: string, docId: string): FamilyData {
  const members: Member[] = [];
  const relationships: Relationship[] = [];
  
  // 1. Settings
  const settings: FamilySettings = {
    familyName: 'Parsed Family Archive',
    village: '',
    familyId: docId.substring(0, 8),
    version: '1.0',
    driveFolderId: ''
  };

  // 2. Split document by member tags like [member_id]
  const memberBlocks = docHtml.split(/\[([a-zA-Z0-9_-]+)\]/i);
  
  // memberBlocks will be: [header_text, memberId_1, content_1, memberId_2, content_2, ...]
  if (memberBlocks.length > 1) {
    // Attempt to parse family name from document title/first paragraph if available
    const headerText = memberBlocks[0];
    const titleMatch = headerText.match(/<h1>(.*?)<\/h1>/i) || headerText.match(/<p><strong>(.*?)<\/strong>/i);
    if (titleMatch && titleMatch[1]) {
      settings.familyName = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
    }

    for (let i = 1; i < memberBlocks.length; i += 2) {
      const memberId = memberBlocks[i].trim();
      const blockHtml = memberBlocks[i + 1] || '';
      
      // Clean HTML tags to get raw text for parsing
      const blockText = blockHtml.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
      
      // Extract Display Name (usually the first text before paragraph breaks or headings)
      const nameMatch = blockHtml.match(/^[^<]*/i) || blockHtml.match(/^(?:<strong>)?(.*?)(?:<\/strong>)?(?:<\/p>|<h1>|<h2>|---)/i);
      let displayName = nameMatch ? nameMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : '';
      if (!displayName) {
        displayName = memberId.replace(/[_-]/g, ' ');
        displayName = displayName.replace(/\b\w/g, c => c.toUpperCase());
      }
      
      // Remove tags/parenthesis from displayName
      displayName = displayName.replace(/\(.*?\)/g, '').trim();

      // Extract First and Last Name
      const nameParts = displayName.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      // Initialize Member object
      const member: Member = {
        memberId,
        firstName,
        lastName,
        displayName,
        gender: 'Male', // Default, will infer
        dob: '',
        alive: 'Yes',
        biographyDocId: docId // Links biography back to this single doc!
      };

      // 3. Infer Gender from keywords
      const lowerText = blockText.toLowerCase();
      if (lowerText.includes(' wife ') || lowerText.includes(' daughter ') || lowerText.includes(' sister ') || lowerText.includes(' mother ') || lowerText.includes(' matriarch ')) {
        member.gender = 'Female';
      }

      // 4. Parse DOB & DOD (e.g. "13 April 1909 – 14 May 1985" or "Born: 1942" or "(1880 - 1955)")
      const dateRangeMatch = blockText.match(/\(([^)]*?\d{4}[^)]*?)\)/) || blockText.match(/(\d{1,2}\s+[a-zA-Z]+\s+\d{4})\s*–\s*(\d{1,2}\s+[a-zA-Z]+\s+\d{4})/i);
      if (dateRangeMatch) {
        const parts = dateRangeMatch[1].split(/[–-]/);
        if (parts[0]) {
          const dobYearMatch = parts[0].match(/\d{4}/);
          if (dobYearMatch) member.dob = dobYearMatch[0] + '-01-01'; // Default to Jan 1st of year
        }
        if (parts[1]) {
          const dodYearMatch = parts[1].match(/\d{4}/);
          if (dodYearMatch) {
            member.dod = dodYearMatch[0] + '-01-01';
            member.alive = 'No';
          }
        }
      } else {
        // Fallback simple Born check
        const bornMatch = blockText.match(/born(?:\s+in|\s+on)?\s+([a-zA-Z]+)?\s*(\d{4})/i);
        if (bornMatch) {
          member.dob = bornMatch[2] + '-01-01';
        }
        const diedMatch = blockText.match(/(?:died|passed\s+away)(?:\s+in|\s+on)?\s+([a-zA-Z]+)?\s*(\d{4})/i);
        if (diedMatch) {
          member.dod = diedMatch[2] + '-01-01';
          member.alive = 'No';
        }
      }

      // 5. Parse Occupation & Education
      const occMatch = blockText.match(/(?:worked as|served as|was a|was an)\s+([a-zA-Z0-9\s,]+?)(?:\.|\bfor\b|\bin\b)/i);
      if (occMatch && occMatch[1]) {
        member.occupation = occMatch[1].trim().substring(0, 50);
      }
      
      const eduMatch = blockText.match(/(?:educated at|completed study at|degree from)\s+([a-zA-Z0-9\s',]+?)(?:\.|\band\b|\bfor\b)/i);
      if (eduMatch && eduMatch[1]) {
        member.education = eduMatch[1].trim().substring(0, 60);
      }

      // Parse Location residence
      const locMatch = blockText.match(/(?:resided in|based in|living in|lived in)\s+([a-zA-Z\s]+?)(?:\.|\bfrom\b)/i);
      if (locMatch && locMatch[1]) {
        member.location = locMatch[1].trim().substring(0, 30);
      }

      members.push(member);
    }
  }

  // 6. Second Pass: Scan text again to build relationships based on display name references
  if (memberBlocks.length > 1) {
    for (let i = 1; i < memberBlocks.length; i += 2) {
      const memberId = memberBlocks[i].trim();
      const blockHtml = memberBlocks[i + 1] || '';
      const blockText = blockHtml.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
      const lowerText = blockText.toLowerCase();

      const currentMember = members.find(m => m.memberId === memberId);
      if (!currentMember) continue;

      // Scan other members to check relations
      members.forEach(other => {
        if (other.memberId === memberId) return;

        const otherName = other.displayName.toLowerCase();
        
        // Father/Mother check: e.g. "son of Yagappa Nadar" or "daughter of Gnanammal"
        const parentOfRegex = new RegExp(`(?:son|daughter|child)\\s+(?:of)\\s+${otherName}`, 'i');
        if (parentOfRegex.test(lowerText)) {
          if (other.gender === 'Male') {
            currentMember.fatherId = other.memberId;
            relationships.push({ fromId: other.memberId, relationType: 'Father', toId: currentMember.memberId });
          } else {
            currentMember.motherId = other.memberId;
            relationships.push({ fromId: other.memberId, relationType: 'Mother', toId: currentMember.memberId });
          }
        }

        // Spouse check: e.g. "married to Philomena Soosaiammal" or "husband of Philomena"
        const spouseRegex = new RegExp(`(?:married\\s+to|husband\\s+of|wife\\s+of)\\s+${otherName}`, 'i');
        if (spouseRegex.test(lowerText)) {
          currentMember.spouseId = other.memberId;
          other.spouseId = currentMember.memberId;
        }

        // Sibling check (if father matches)
        if (currentMember.fatherId && other.fatherId && currentMember.fatherId === other.fatherId) {
          // Implicit sibling relationship
        }
      });
    }
  }

  return {
    settings,
    members,
    relationships,
    events: [],
    stories: [],
    documents: [],
    photos: [],
    places: []
  };
}
