import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client;
  private appName: string;
  private appUrl: string;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );

    this.appName = this.configService.get('APP_NAME') || 'Backend UAM';
    this.appUrl =
      this.configService.get('APP_URL') || 'https://backend-uam.com';
  }
  async sendAccessSms(
    phone: string,
    code: string,
    name: string,
  ): Promise<void> {
    try {
      const message = await this.client.messages.create({
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phone,
        body: `Hola ${name}, tu código de acceso es ${code}`,
      });
      console.log(message.sid);
    } catch (error) {
      console.log(error);
    }
  }
}
