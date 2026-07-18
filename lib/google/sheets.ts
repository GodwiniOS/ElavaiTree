import { getSheetsClient } from './google';
import { FamilyData, FamilySettings, Member, Relationship, FamilyEvent, Story, Document, Photo, Place } from '@/types';
import { cache } from 'react';
import { MOCK_FAMILY_DATA } from './mockData';
import { getGoogleDoc } from './docs';
import { parseDocToFamilyData } from '../parser/docParser';

// Cache data in memory with TTL (30 seconds) to handle fast page reloads and API rate limits
interface CacheEntry {
  data: FamilyData;
  timestamp: number;
}
const memoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30000; // 30 seconds

// Tab Schemas & Names
const TABS = {
  Settings: ['Key', 'Value'],
  Members: ['MemberID', 'FirstName', 'LastName', 'DisplayName', 'Gender', 'DOB', 'DOD', 'Alive', 'FatherID', 'MotherID', 'SpouseID', 'PhotoURL', 'Occupation', 'Education', 'Location', 'BiographyDocID', 'Status'],
  Relationships: ['FromID', 'RelationType', 'ToID'],
  Events: ['EventID', 'Title', 'Description', 'Date', 'Location', 'Members', 'PhotoFolderID'],
  Stories: ['StoryID', 'Title', 'GoogleDocID', 'Author', 'CreatedDate', 'Tags'],
  Documents: ['DocumentID', 'Name', 'GoogleDriveURL', 'Owner', 'Category'],
  Photos: ['PhotoID', 'MemberID', 'DriveImageUrl', 'Caption'],
  Places: ['PlaceID', 'Name', 'Latitude', 'Longitude', 'Description']
};

function extractId(input: string): string {
  const clean = decodeURIComponent(input).trim();
  if (clean.includes('docs.google.com') || clean.includes('/d/')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return clean;
}

export const getFamilyData = cache(async (spreadsheetId: string, forceFresh = false): Promise<FamilyData> => {
  const extractedId = extractId(spreadsheetId);
  const normId = extractedId.toLowerCase();
  if (
    normId === 'mock' || 
    normId === 'viyagappa' || 
    normId === '13nwutzfzwtdmy4hydsnxtyvdqia3zbqnspt0pjidp1c'
  ) {
    return MOCK_FAMILY_DATA;
  }

  const cached = memoryCache[extractedId];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL && !forceFresh) {
    return cached.data;
  }

  try {
    const sheets = await getSheetsClient();
    
    // Check sheet tabs metadata first
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const tabNames = metadata.data.sheets?.map(s => s.properties?.title || '') || [];
    
    // Auto-initialize if some standard tabs are missing
    const missingTabs = Object.keys(TABS).filter(t => !tabNames.includes(t));
    if (missingTabs.length > 0) {
      await initializeSpreadsheetTabs(spreadsheetId, missingTabs);
    }

    // Fetch values from all tabs in parallel
    const ranges = Object.keys(TABS).map(tab => `${tab}!A:Z`);
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = response.data.valueRanges || [];
    const rawData: Record<string, any[][]> = {};
    Object.keys(TABS).forEach((tab, index) => {
      rawData[tab] = valueRanges[index]?.values || [];
    });

    // Parse Settings
    const settingsRows = rawData['Settings'];
    const settingsObj: Partial<FamilySettings> = {};
    settingsRows.forEach(row => {
      if (row[0] && row[1]) {
        const key = row[0].toString().trim();
        const val = row[1].toString().trim();
        if (key === 'Family Name') settingsObj.familyName = val;
        if (key === 'Village') settingsObj.village = val;
        if (key === 'Family ID') settingsObj.familyId = val;
        if (key === 'Spreadsheet Version') settingsObj.version = val;
        if (key === 'Drive Folder ID') settingsObj.driveFolderId = val;
      }
    });

    const settings: FamilySettings = {
      familyName: settingsObj.familyName || 'My Family',
      village: settingsObj.village || '',
      familyId: settingsObj.familyId || spreadsheetId.substring(0, 8),
      version: settingsObj.version || '1.0',
      driveFolderId: settingsObj.driveFolderId || '',
    };

    // Parse Members
    const members = parseTabRows<Member>(rawData['Members'], TABS.Members, row => ({
      memberId: row.MemberID || '',
      firstName: row.FirstName || '',
      lastName: row.LastName || '',
      displayName: row.DisplayName || `${row.FirstName || ''} ${row.LastName || ''}`.trim(),
      gender: (row.Gender || 'Male') as any,
      dob: row.DOB || '',
      dod: row.DOD || undefined,
      alive: (row.Alive || 'Yes') as any,
      fatherId: row.FatherID || undefined,
      motherId: row.MotherID || undefined,
      spouseId: row.SpouseID || undefined,
      photoUrl: row.PhotoURL || undefined,
      occupation: row.Occupation || undefined,
      education: row.Education || undefined,
      location: row.Location || undefined,
      biographyDocId: row.BiographyDocID || undefined,
      status: row.Status || undefined,
    }));

    // Parse Relationships
    const relationships = parseTabRows<Relationship>(rawData['Relationships'], TABS.Relationships, row => ({
      fromId: row.FromID || '',
      relationType: row.RelationType || '',
      toId: row.ToID || '',
    }));

    // Parse Events
    const events = parseTabRows<FamilyEvent>(rawData['Events'], TABS.Events, row => ({
      eventId: row.EventID || '',
      title: row.Title || '',
      description: row.Description || '',
      date: row.Date || '',
      location: row.Location || '',
      members: row.Members || '',
      photoFolderId: row.PhotoFolderID || undefined,
    }));

    // Parse Stories
    const stories = parseTabRows<Story>(rawData['Stories'], TABS.Stories, row => ({
      storyId: row.StoryID || '',
      title: row.Title || '',
      googleDocId: row.GoogleDocID || '',
      author: row.Author || '',
      createdDate: row.CreatedDate || '',
      tags: row.Tags || '',
    }));

    // Parse Documents
    const documents = parseTabRows<Document>(rawData['Documents'], TABS.Documents, row => ({
      documentId: row.DocumentID || '',
      name: row.Name || '',
      googleDriveUrl: row.GoogleDriveURL || '',
      owner: row.Owner || '',
      category: row.Category || '',
    }));

    // Parse Photos
    const photos = parseTabRows<Photo>(rawData['Photos'], TABS.Photos, row => ({
      photoId: row.PhotoID || '',
      memberId: row.MemberID || '',
      driveImageUrl: row.DriveImageUrl || '',
      caption: row.Caption || '',
    }));

    // Parse Places
    const places = parseTabRows<Place>(rawData['Places'], TABS.Places, row => ({
      placeId: row.PlaceID || '',
      name: row.Name || '',
      latitude: parseFloat(row.Latitude || '0'),
      longitude: parseFloat(row.Longitude || '0'),
      description: row.Description || '',
    }));

    const result: FamilyData = { settings, members, relationships, events, stories, documents, photos, places };
    memoryCache[spreadsheetId] = { data: result, timestamp: Date.now() };
    return result;
  } catch (err: any) {
    try {
      console.log(`Sheets API failed. Attempting to parse spreadsheetId as Google Doc ID: ${spreadsheetId}`);
      const doc = await getGoogleDoc(spreadsheetId);
      const parsedData = parseDocToFamilyData(doc.html, spreadsheetId);
      if (parsedData.members.length > 0) {
        parsedData.settings.familyName = doc.title || 'My Family';
        memoryCache[spreadsheetId] = { data: parsedData, timestamp: Date.now() };
        return parsedData;
      }
    } catch (docErr) {
      console.error('Failed to parse as Google Doc:', docErr);
    }
    console.error('Error fetching Family Data from Sheets:', err);
    throw err;
  }
});

// Helper: Parse rows mapping them by header columns
function parseTabRows<T>(rawRows: any[][], headers: string[], mapper: (row: Record<string, string>) => T): T[] {
  if (rawRows.length <= 1) return [];
  const actualHeaders = rawRows[0].map(h => h.toString().trim());
  
  return rawRows.slice(1).map(row => {
    const rowObj: Record<string, string> = {};
    headers.forEach(h => {
      const idx = actualHeaders.indexOf(h);
      rowObj[h] = idx !== -1 && row[idx] !== undefined ? row[idx].toString().trim() : '';
    });
    return mapper(rowObj);
  }).filter(item => {
    // Basic filter to ensure item has a valid ID
    const keys = Object.keys(item as any);
    const primaryIdKey = keys[0];
    return !!(item as any)[primaryIdKey];
  });
}

// Set up sheet tabs and write headers
async function initializeSpreadsheetTabs(spreadsheetId: string, missingTabs: string[]) {
  const sheets = await getSheetsClient();
  
  // Add missing sheets
  if (missingTabs.length > 0) {
    const requests = missingTabs.map(title => ({
      addSheet: { properties: { title } }
    }));
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  }

  // Populate headers
  const data = missingTabs.map(tabName => {
    let headers: string[] = [];
    if (tabName === 'Settings') {
      return {
        range: 'Settings!A1:B5',
        values: [
          ['Key', 'Value'],
          ['Family Name', 'My Family'],
          ['Village', ''],
          ['Family ID', spreadsheetId.substring(0, 8)],
          ['Spreadsheet Version', '1.0'],
          ['Drive Folder ID', '']
        ]
      };
    } else {
      headers = (TABS as any)[tabName];
    }
    return {
      range: `${tabName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      values: [headers]
    };
  });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      data,
      valueInputOption: 'RAW'
    }
  });
}

// Save / Update Settings
export async function saveSettings(spreadsheetId: string, settings: FamilySettings) {
  const sheets = await getSheetsClient();
  const values = [
    ['Key', 'Value'],
    ['Family Name', settings.familyName],
    ['Village', settings.village],
    ['Family ID', settings.familyId],
    ['Spreadsheet Version', settings.version],
    ['Drive Folder ID', settings.driveFolderId]
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Settings!A1:B6',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
  // Clear cache
  delete memoryCache[spreadsheetId];
}

// Append or Update Row in sheet
async function updateSheetRows(spreadsheetId: string, tabName: string, headers: string[], idColumnName: string, idValue: string, newRowData: Record<string, any>) {
  const sheets = await getSheetsClient();
  
  // Read all existing rows to find correct line or append
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:Z`
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) {
    // If empty write headers first
    rows.push(headers);
  }
  
  const actualHeaders = rows[0].map(h => h.toString().trim());
  const idColIdx = actualHeaders.indexOf(idColumnName);
  
  if (idColIdx === -1) {
    throw new Error(`Column ${idColumnName} not found in ${tabName}`);
  }

  // Construct row values
  const rowValues: any[] = new Array(Math.max(headers.length, actualHeaders.length)).fill('');
  actualHeaders.forEach((header, index) => {
    if (newRowData[header] !== undefined) {
      rowValues[index] = newRowData[header];
    }
  });
  
  // Find matching row
  let rowNumToUpdate = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIdx] === idValue) {
      rowNumToUpdate = i + 1; // 1-indexed for sheets
      break;
    }
  }

  if (rowNumToUpdate !== -1) {
    // Update existing row
    const range = `${tabName}!A${rowNumToUpdate}:${String.fromCharCode(65 + rowValues.length - 1)}${rowNumToUpdate}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] }
    });
  } else {
    // Append new row
    const range = `${tabName}!A1`;
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowValues] }
    });
  }
  
  // Clear cache
  delete memoryCache[spreadsheetId];
}

// Delete Row from sheet
async function deleteSheetRow(spreadsheetId: string, tabName: string, idColumnName: string, idValue: string) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:Z`
  });
  
  const rows = response.data.values || [];
  if (rows.length === 0) return;

  const actualHeaders = rows[0].map(h => h.toString().trim());
  const idColIdx = actualHeaders.indexOf(idColumnName);
  if (idColIdx === -1) return;

  let rowIdxToDelete = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIdx] === idValue) {
      rowIdxToDelete = i;
      break;
    }
  }

  if (rowIdxToDelete !== -1) {
    // Find Sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = metadata.data.sheets?.find(s => s.properties?.title === tabName);
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIdxToDelete,
                endIndex: rowIdxToDelete + 1
              }
            }
          }]
        }
      });
    }
  }
  // Clear cache
  delete memoryCache[spreadsheetId];
}

// CRUD operations
export async function saveMember(spreadsheetId: string, member: Member) {
  await updateSheetRows(spreadsheetId, 'Members', TABS.Members, 'MemberID', member.memberId, {
    MemberID: member.memberId,
    FirstName: member.firstName,
    LastName: member.lastName,
    DisplayName: member.displayName,
    Gender: member.gender,
    DOB: member.dob,
    DOD: member.dod || '',
    Alive: member.alive,
    FatherID: member.fatherId || '',
    MotherID: member.motherId || '',
    SpouseID: member.spouseId || '',
    PhotoURL: member.photoUrl || '',
    Occupation: member.occupation || '',
    Education: member.education || '',
    Location: member.location || '',
    BiographyDocID: member.biographyDocId || '',
    Status: member.status || ''
  });
}

export async function deleteMember(spreadsheetId: string, memberId: string) {
  await deleteSheetRow(spreadsheetId, 'Members', 'MemberID', memberId);
}

export async function saveRelationship(spreadsheetId: string, rel: Relationship) {
  // Use unique key or composite matching
  await updateSheetRows(spreadsheetId, 'Relationships', TABS.Relationships, 'FromID', rel.fromId, {
    FromID: rel.fromId,
    RelationType: rel.relationType,
    ToID: rel.toId
  });
}

export async function saveEvent(spreadsheetId: string, event: FamilyEvent) {
  await updateSheetRows(spreadsheetId, 'Events', TABS.Events, 'EventID', event.eventId, {
    EventID: event.eventId,
    Title: event.title,
    Description: event.description,
    Date: event.date,
    Location: event.location,
    Members: event.members,
    PhotoFolderID: event.photoFolderId || ''
  });
}

export async function saveStory(spreadsheetId: string, story: Story) {
  await updateSheetRows(spreadsheetId, 'Stories', TABS.Stories, 'StoryID', story.storyId, {
    StoryID: story.storyId,
    Title: story.title,
    GoogleDocID: story.googleDocId,
    Author: story.author,
    CreatedDate: story.createdDate,
    Tags: story.tags
  });
}

export async function saveDocument(spreadsheetId: string, doc: Document) {
  await updateSheetRows(spreadsheetId, 'Documents', TABS.Documents, 'DocumentID', doc.documentId, {
    DocumentID: doc.documentId,
    Name: doc.name,
    GoogleDriveURL: doc.googleDriveUrl,
    Owner: doc.owner,
    Category: doc.category
  });
}

export async function savePhoto(spreadsheetId: string, photo: Photo) {
  await updateSheetRows(spreadsheetId, 'Photos', TABS.Photos, 'PhotoID', photo.photoId, {
    PhotoID: photo.photoId,
    MemberID: photo.memberId,
    DriveImageUrl: photo.driveImageUrl,
    Caption: photo.caption
  });
}

export async function savePlace(spreadsheetId: string, place: Place) {
  await updateSheetRows(spreadsheetId, 'Places', TABS.Places, 'PlaceID', place.placeId, {
    PlaceID: place.placeId,
    Name: place.name,
    Latitude: place.latitude.toString(),
    Longitude: place.longitude.toString(),
    Description: place.description
  });
}
