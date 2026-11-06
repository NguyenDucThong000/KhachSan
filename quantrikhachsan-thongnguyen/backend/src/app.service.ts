import { Injectable } from '@nestjs/common';
import { RoomsService } from './rooms/rooms.service';

@Injectable()
export class AppService {
  // Tiêm RoomsService vào để dùng
  constructor(private readonly roomsService: RoomsService) {}

  async getHello() {
    const rooms = await this.roomsService.findAll();
    const operationalLabels: Record<string, string> = {
      AVAILABLE: 'Trống',
      RESERVED: 'Đã đặt',
      OCCUPIED: 'Đang sử dụng',
    };
    const cleaningLabels: Record<string, string> = {
      CLEAN: 'Sạch',
      DIRTY: 'Cần dọn',
      CLEANING: 'Đang dọn',
    };
    const technicalLabels: Record<string, string> = {
      NORMAL: 'Bình thường',
      MAINTENANCE: 'Đang bảo trì',
      OUT_OF_SERVICE: 'Ngừng hoạt động',
    };
    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        };
        return entities[character];
      });
    const label = (labels: Record<string, string>, value: string | null) =>
      value ? labels[value] ?? value : 'Chưa cập nhật';
    const rows = rooms
      .map(
        (room) => `
          <tr>
            <td>${escapeHtml(room.room_number)}</td>
            <td>${label(operationalLabels, room.operational_status)}</td>
            <td>${label(cleaningLabels, room.cleaning_status)}</td>
            <td>${label(technicalLabels, room.technical_status)}</td>
          </tr>`,
      )
      .join('');

    return `<!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Danh sách phòng</title>
          <style>
            body { font: 16px system-ui, sans-serif; margin: 0; padding: 32px; color: #172033; background: #f4f7fb; }
            main { max-width: 900px; margin: auto; }
            h1 { margin-bottom: 8px; }
            p { color: #586174; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px #17203312; }
            th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e8ecf2; }
            th { background: #edf2f8; }
            tr:last-child td { border-bottom: 0; }
            @media (max-width: 600px) { body { padding: 16px; } th, td { padding: 10px 8px; font-size: 14px; } }
          </style>
        </head>
        <body>
          <main>
            <h1>Danh sách phòng</h1>
            <p>Tổng số phòng: ${rooms.length}</p>
            <table>
              <thead><tr><th>Phòng</th><th>Tình trạng</th><th>Vệ sinh</th><th>Kỹ thuật</th></tr></thead>
              <tbody>${rows || '<tr><td colspan="4">Chưa có phòng nào.</td></tr>'}</tbody>
            </table>
          </main>
        </body>
      </html>`;
  }
}