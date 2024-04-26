import { diffMinutes, format } from "@formkit/tempo";
import { GoogleSpreadsheet } from "google-spreadsheet";

const SHEET_ID = process.env.SHEET_ID ?? "";
const API_KEY = process.env.API_KEY ?? "";
const A1_RANGE = process.env.A1_RANGE ?? "";
const SHEET_TITLE = process.env.SHEET_TITLE ?? "";
const LINE_ENDPOINT = process.env.LINE_ENDPOINT ?? "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";

class EventNotifier {
  private client!: GoogleSpreadsheet;

  constructor() {
    this.client = new GoogleSpreadsheet(SHEET_ID, {
      apiKey: API_KEY,
    });
  }

  public async sendLINEMessage(args: string[]) {
    await fetch(LINE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [
          {
            type: "text",
            text: this.makeMessageString(args),
          },
        ],
      }),
    });
  }

  private makeMessageString(args: string[]): string {
    const formattedDate = format(args[1], {
      date: "medium",
      time: "short",
    });

    return `
<イベントが開始します>
イベント名: ${args[0]}
開始時刻: ${formattedDate}
URL: ${args[2]}
その他: ${args[3] ?? ""}
`;
  }

  public async notify() {
    await this.client.loadInfo();
    await this.client.loadCells(A1_RANGE);
    const sheet = this.client.sheetsByTitle[SHEET_TITLE];
    const cells = await sheet.getCellsInRange(A1_RANGE);

    for (let i = 0; i < cells.length; i++) {
      if (!!cells[i][1] === false) continue;

      const diff = diffMinutes(cells[i][1], new Date().toISOString());
      if (diff >= 0 && diff <= 5) {
        this.sendLINEMessage(cells[i]);
      }
    }
  }
}

const eventNotifier = new EventNotifier();
eventNotifier.notify();
