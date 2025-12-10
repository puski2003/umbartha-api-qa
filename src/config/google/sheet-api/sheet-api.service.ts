import { Injectable, Scope } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable({ scope: Scope.REQUEST })
export class SheetApiService {
  private readonly clientEmail: string;
  private readonly privateKey: string;

  constructor() {
    this.clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join(
      '\n',
    );
  }

  async getGoogleSheetClient() {
    const auth: any = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.clientEmail,
        private_key: this.privateKey,
      },
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const authClient = await auth.getClient();

    return google.sheets({
      version: 'v4',
      auth: authClient,
    });
  }

  async getNextRowNumber(
    googleSheetClient,
    sheetId: string,
    tabName: string,
  ): Promise<number> {
    const response = await googleSheetClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!A:A`,
    });

    const rows = response.data.values ? response.data.values.length : 0;
    return rows + 1;
  }

  async writeGoogleSheet(
    googleSheetClient,
    sheetId: string,
    tabName: string,
    cellAddress: string,
    value: string,
  ) {
    try {
      await googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!${cellAddress}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[value]],
        },
      });
    } catch (e) {
      console.error('Error writing to sheet:', e.response?.data || e.message);
    }
  }

  async readGoogleSheet(
    googleSheetClient,
    sheetId: string,
    tabName: string,
    cellAddress: string,
  ) {
    try {
      const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${cellAddress}`,
      });

      return res.data.values[0][0];
    } catch (e) {
      return null;
    }
  }
}
