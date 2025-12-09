import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

export default {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  adminId: process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : undefined,
};