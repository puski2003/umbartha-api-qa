import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
} from '@aws-sdk/client-ses';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SendEmailI, SendRawEmailI } from './types';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class SESService {
  private sesClient: SESClient;
  constructor() {
    this.sesClient = new SESClient({
      region: `${process.env.REGION}`,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
  }

  async sendEmail(email: SendEmailI) {
    const createSendEmailCommand = () => {
      return new SendEmailCommand({
        Destination: {
          CcAddresses: email.ccAddresses,
          ToAddresses: email.toAddresses,
          BccAddresses: email.bccAddresses,
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `${email.htmlData}`,
            },
            Text: {
              Charset: 'UTF-8',
              Data: `${email.textData}`,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `${email.subject}`,
          },
        },
        Source: isNotEmpty(email.source)
          ? email.source
          : 'no-reply@umbartha.org',
        ReplyToAddresses: email.replyToAddresses,
      });
    };

    const sendEmailCommand = createSendEmailCommand();

    try {
      return await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      console.error(e);
      Logger.error('FAILED TO SEND EMAIL');
      throw new BadRequestException(e);
    }
  }

  async sendRawEmail(email: SendRawEmailI) {
    const rawMessage = async (
      from: string,
      to: string[],
      subject: string,
      body: string,
      fileName: string,
      icsContent: string,
    ) => {
      const message = `From: ${from}\nTo: ${to}\nSubject: ${subject}\nMIME-Version: 1.0\nContent-type: Multipart/Mixed; boundary="NextPart"\n\n--NextPart\nContent-Type: text/html\n\n${body}\n\n--NextPart\nContent-Type: text/plain;\nContent-Disposition: attachment; filename=${fileName}.ics\n\n${icsContent}\n\n--NextPart--`;

      return Buffer.from(message);
    };

    const createdSendRawEmailCommand = new SendRawEmailCommand({
      Source: isNotEmpty(email.source) ? email.source : 'no-reply@umbartha.org',
      Destinations: email.toAddresses,
      RawMessage: {
        Data: await rawMessage(
          isNotEmpty(email.source) ? email.source : 'no-reply@umbartha.org',
          email.toAddresses,
          email.subject,
          email.htmlData,
          email.fileName,
          email.file,
        ),
      },
    });

    try {
      return await this.sesClient.send(createdSendRawEmailCommand);
    } catch (e) {
      console.error(e);
      Logger.error('FAILED TO SEND RAW EMAIL');
      throw new BadRequestException(e.message);
    }
  }
}
