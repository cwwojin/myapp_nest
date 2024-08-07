import { DocumentBuilder } from '@nestjs/swagger';

export class BaseDocumentBuilder extends DocumentBuilder {
  constructor() {
    super();
  }

  public initOptions() {
    return this.setTitle('URL Shortener App - Backend')
      .setDescription('The URL Shortener Backend - API Description')
      .setVersion('0.0.1')
      .build();
  }
}
