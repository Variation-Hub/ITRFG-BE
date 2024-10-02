import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { JobType, Levels, UserType } from 'src/enums/enums';

@Schema({ collection: 'candidate' })
export class Candidate extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  nationality: string;

  @Prop()
  referralCode?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'candidate' })
  userType: UserType.Candidate;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ default: null })
  photo?: string;

  @Prop({ default: null })
  summary?: string;

  @Prop({ default: null })
  displayName?: string;

  @Prop({
    type: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
    },
    _id: false,
  })
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  destinationCountry: string;

  @Prop()
  education?: Array<{
    field: string;
    yearOfPassing: string;
    university: string;
    duration: string;
  }>;

  @Prop()
  certifications?: Array<{
    certificationName: string;
    certificationYear: string;
  }>;

  @Prop()
  previousEmploymentDetail?: Array<{
    serviceLength: {
      years: string;
      months: string;
    };
    organisationName: string;
    designation: string;
    description: string;
    referenceDetails: string;
  }>;

  @Prop()
  previousReferences?: Array<{
    name: string;
    email: string;
    phoneNumber: string;
  }>;

  @Prop({
    type: {
      organisationName: String,
      workingSince: {
        years: String,
        months: String,
      },
      designation: String,
      description: String,
      jobType: String,
    },
    _id: false,
  })
  currentEmploymentDetail?: {
    organisationName: string;
    workingSince: {
      years: string;
      months: string;
    };
    designation: string;
    description: string;
    jobType: string;
  };

  @Prop({ required: true })
  skills: Array<{
    skill: string;
    level: Levels;
  }>;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
