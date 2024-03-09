import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ETagsGroup } from 'src/private/tags/tags.types';

@Schema()
export class Tag {
  @Prop()
  name: string;

  @Prop()
  group: ETagsGroup;
}

export type TagDocument = Tag & Document;

export const PropertySchema = SchemaFactory.createForClass(Tag);
