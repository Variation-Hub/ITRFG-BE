import {
  IsString,
  IsInt,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmptyObject,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, Levels } from 'src/enums/enums';

class AddressDto {
  @IsOptional()
  @IsString()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  country: string;
}

class GraduationDto {
  @IsNotEmpty()
  @IsString()
  field: string;

  @IsNotEmpty()
  @IsString()
  yearOfPassing: string;

  @IsNotEmpty()
  @IsString()
  university: string;

  @IsNotEmpty()
  @IsString()
  duration: string;
}

class ServiceLengthDto {
  @IsNotEmpty()
  @IsString()
  years: string;

  @IsNotEmpty()
  @IsString()
  months: string;
}

class EmploymentDetailDto {
  @ValidateNested({})
  @Type(() => ServiceLengthDto)
  serviceLength: ServiceLengthDto;

  @IsNotEmpty()
  @IsString()
  organisationName: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  referenceDetails: string;
}

class CurrentEmploymentDetailDto {
  @IsNotEmpty()
  @IsString()
  organisationName: string;

  @ValidateNested({})
  @Type(() => ServiceLengthDto)
  workingSince: ServiceLengthDto;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(JobType)
  jobType: JobType;
}

class ReferenceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

class CertificationsDto {
  @IsNotEmpty()
  @IsString()
  certificationName: string;

  @IsNotEmpty()
  @IsString()
  certificationYear: string;
}

class SkillDto {
  @IsString()
  skill: string;

  @IsString()
  level: Levels;
}

export class CandidateApiDto {
  userId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsNotEmpty()
  @IsString()
  destinationCountry: string;

  @IsOptional()
  @ValidateNested({})
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @ValidateNested({})
  @Type(() => GraduationDto)
  education?: GraduationDto[];

  // @IsNotEmpty()
  // @IsNumber()
  // totalExperience: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmploymentDetailDto)
  previousEmploymentDetail?: EmploymentDetailDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  previousReferences?: ReferenceDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CertificationsDto)
  certifications?: CertificationsDto[];

  @IsOptional()
  @ValidateNested({})
  @Type(() => CurrentEmploymentDetailDto)
  currentEmploymentDetail?: CurrentEmploymentDetailDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
