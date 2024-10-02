import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from 'src/enums/enums';

@Schema({ collection: 'user' })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  userType: UserType;

  @Prop({})
  accessToken: string;

  @Prop({})
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
