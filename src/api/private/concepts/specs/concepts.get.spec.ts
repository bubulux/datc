import * as request from 'supertest';
import { INestApplication, HttpStatus } from '@nestjs/common';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { testUtilCreateIntegrationTestModule } from 'src/utils/tests.utils';
import { ConceptsController } from 'src/api/private/concepts/concepts.controller';
import { ConceptsService } from 'src/api/private/concepts/concepts.service';
import {
  Concept,
  ConceptSchema,
} from 'src/api/private/concepts/models/concepts.schema';

describe('ConceptsController - Create ops for icons (integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let concept: mongoose.Model<Concept>;
  beforeAll(async () => {
    const result = await testUtilCreateIntegrationTestModule([
      {
        controller: ConceptsController,
        service: ConceptsService,
        model: Concept,
        schema: ConceptSchema,
      },
    ]);
    app = result.app;
    mongoServer = result.mongoServer;
    concept = result.models[0];
  });

  beforeEach(async () => {
    await concept.create({ name: 'concept1', icon: 'icon1' });
    await concept.create({ name: 'concept2', icon: 'icon2' });
    await concept.create({ name: 'concept3', icon: 'icon3' });
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await app.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Gets all the concepts', async () => {
    const response = await request(app.getHttpServer())
      .get('/concepts')
      .expect(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { name: 'concept1', icon: 'icon1' },
        { name: 'concept2', icon: 'icon2' },
        { name: 'concept3', icon: 'icon3' },
      ]),
    );
  });
});
