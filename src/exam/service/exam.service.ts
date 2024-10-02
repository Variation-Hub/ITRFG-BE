import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam } from 'src/schemas/exam.schema';
import { Question } from 'src/schemas/question.schema';
import { Request } from 'express';
import axios from 'axios';
import { RequestWithUser } from 'src/interface/global.interface';
import { Candidate } from 'src/schemas/candidate.schema';
import { v4 } from 'uuid';
import * as fs from 'fs';
import Joi, { string } from 'joi';
import { Result } from 'src/enums/enums';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Exam.name) private examModel: Model<Exam>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
  ) {}

  async examSubjective(type: string, request: RequestWithUser) {
    console.log(request.body.skill, 'Dsd');
    try {
      const userId = request.userId;
      if (type == 'candidate') {
        const candidate = await this.candidateModel.findOne({ userId }).exec();

        if (!candidate) {
          // Throw an exception if no candidate is found
          throw new NotFoundException('Candidate not found');
        }
      }

      const skill = request.body.skill;
      const level = request.body.level;
      console.log(request.body.skill, 'Dsd');
      const prompt = `Generate always two difficult subjective coding questions based on data structures and algorithm for ${level} level include only array , sorting and string problems only. The question should be difficult to answer. The format of the question should always be in JSON format with the following key-value pairs:
 
        Example:
        [
          {
          "type": "subjective",
          "difficulty": "difficult",
          "skill": \`${skill}\`,
          "question": "Write a function to reverse a string using a stack.",
          "explanation": "Write a function that takes a string as input and returns a new string with the characters reversed using a stack. The stack will be used to store the characters of the input string in reverse order, and then the reversed string will be constructed by popping the characters from the stack.",
          "test_cases": [{"input": "hello","expected_output": "olleh"},{"input": "algorithm","expected_output": "mhtirogla"},{"input": "data structure","expected_output": "erutcurts atad"}],
          "constraints": "The input string can contain any printable ASCII characters and its length can be up to 1000."
        },
        {
          "type": "subjective",
          "difficulty": "difficult",
          "skill": \`${skill}\`,
          "question": "Write a function to reverse a string using a stack.",
          "explanation": "Write a function that takes a string as input and returns a new string with the characters reversed using a stack. The stack will be used to store the characters of the input string in reverse order, and then the reversed string will be constructed by popping the characters from the stack.",
          "test_cases": [{"input": "hello","expected_output": "olleh"},{"input": "algorithm","expected_output": "mhtirogla"},{"input": "data structure","expected_output": "erutcurts atad"}],
          "constraints": "The input string can contain any printable ASCII characters and its length can be up to 1000."
        }
      ]
         
        The generated question should have test cases and constraints. Ensure that the question is always difficult for the candidate to answer and always return a valid Array of JSON and don't include numbering of the questions in response .`;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
      };
      const data = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
      };

      const question_response = await axios
        .post('https://api.openai.com/v1/chat/completions', data, {
          headers: headers,
        })
        .then((response) => {
          return response.data?.choices?.[0].message;
        });
      console.log('dfsdfdg');
      console.log('response', typeof question_response);
      if (!question_response) {
        throw new HttpException(
          'Failed to generate questions',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log(question_response, 'Dss');
      let cleanedContent = question_response.content;
      // if (
      //   cleanedContent.match(/^\s*1\.\s*\{\s*\}/) ||
      //   cleanedContent.match(/^\s*2\.\s*\{\s*\}/)
      // ) {
      //   cleanedContent = cleanedContent.replace(/^\s*(1\.|2\.)\s*\{\s*\}/, '');
      // }
      // const contentArray =
      //   cleanedContent.split(/\}\s*\n?\s*\{|}\n,{|},\n'{/) ||
      //   cleanedContent.split('}\n,{') ||
      //   cleanedContent.split('\\n},\\n{');

      // const questionArray = contentArray.map((item, index) => {
      //   return index === 0
      //     ? item + '}'
      //     : '{' + item + (index === contentArray.length - 1 ? '' : '}');
      // });

      let questionsArrayFailed = false;
      let questionArray;

      try {
        questionArray = JSON.parse(cleanedContent);
        console.log(questionArray, 'ssds');
      } catch (error) {
        console.error('Error parsing cleanedContent:', error);
        questionsArrayFailed = true;
      }
      // const questionsArrayfinal = questionArray.map((questionArray) => {
      //   try {
      //     const cleanedQuestionArray = questionArray.replace(/\n/g, '');
      //     return JSON.parse(cleanedQuestionArray);
      //   } catch (error) {
      //     console.error('Error parsing questionArray:', error);
      //     questionsArrayFailed = true;
      //   }
      // });

      if (!questionsArrayFailed) {
        const questionsData: Array<object> = questionArray.map((item) => ({
          id: v4(),
          question: item.question,
          type: 'Coding',
          explanation: item.explanation,
          test_cases: item.test_cases.map((testCase) => ({ ...testCase })),
          constraints: item.constraints,
        }));

        // console.log(questionsData, 'sfdf');
        // console.log(Array.isArray(questionsData));

        // const questionsfinal = await this.questionModel.create({
        //   skill: request.body.skill,
        //   level: request.body.level,
        //   questionCoding: JSON.stringify(questionsData),
        // });

        const updateSubjective = await this.questionModel.findOneAndUpdate(
          { _id: request.body.questionId },
          { $set: { questionCoding: JSON.stringify(questionsData) } }, // Update the 'status' field to 'completed'
          { new: true }, // Return the updated document
        );
        console.log(updateSubjective, 'ddfd');
        return { status: true, data: updateSubjective, message: 'success' };
      } else {
        const findQuestion = await this.questionModel.aggregate([
          {
            $match: {
              skill: request.body.skill,
              level: request.body.level,
              questionCoding: { $elemMatch: { $exists: true, $ne: [] } },
            },
          },
          {
            $sample: { size: 1 },
          },
        ]);

        if (findQuestion && findQuestion.length > 0) {
          const updateSubjective = await this.questionModel.findOneAndUpdate(
            { _id: request.body.questionId },
            {
              $set: {
                questionCoding: findQuestion[0].questionCoding[0],
              },
            }, // Update the 'status' field to 'completed'
            { new: true }, // Return the updated document
          );
          return { status: true, data: updateSubjective, message: 'success' };
        } else {
          throw new HttpException(
            { message: 'Failed to generate Questions', status: false },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async examMcq(type: string, request: RequestWithUser) {
    console.log(request.body.skill, 'Dsd');
    try {
      const userId = request.userId;
      if (type == 'candidate') {
        const candidate = await this.candidateModel.findOne({ userId }).exec();

        if (!candidate) {
          // Throw an exception if no candidate is found
          throw new NotFoundException('Candidate not found');
        }
      }
      const skill = request.body.skill;
      const level = request.body.level;
      console.log(request.body.skill, 'Dsd');
      const prompt = `Generate always ten difficult multiple choice questions based on ${skill} for ${level} level. The question should be difficult to answer. The format of the question should always be in JSON format with the following key-value pairs:
 
        Example:
        [
          {
          "type": "mcq",
          "difficulty": "difficult",
          "topic": \`${skill}\`,
          "question": "Write a function to reverse a string using a stack.",
          "options": [
            "Implement a function that reverses a string by pushing each character onto a stack and then popping them off to construct the reversed string.",
            "Create a function that uses a loop to iterate through the characters of the string in reverse order and build the reversed string.",
            "Develop a recursive function that divides the string into substrings and reverses them, then combines the reversed substrings to form the final reversed string.",
            "Utilize a built-in library function that directly reverses the characters of the string in place."
          ],
          "answer": "Implement a function that reverses a string by pushing each character onto a stack and then popping them off to construct the reversed string."
        },
        {
          "type": "mcq",
          "difficulty": "difficult",
          "topic": \`${skill}\`,
          "question": "Write a function to reverse a string using a stack.",
          "options": [
            "Implement a function that reverses a string by pushing each character onto a stack and then popping them off to construct the reversed string.",
            "Create a function that uses a loop to iterate through the characters of the string in reverse order and build the reversed string.",
            "Develop a recursive function that divides the string into substrings and reverses them, then combines the reversed substrings to form the final reversed string.",
            "Utilize a built-in library function that directly reverses the characters of the string in place."
          ],
          "answer": "Implement a function that reverses a string by pushing each character onto a stack and then popping them off to construct the reversed string."
        }
      ]
         
        The generated question should have options and answer. Ensure that the question is always difficult for the candidate to answer and always return a valid Array of JSON and don't include numbering of the questions in response .`;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
      };
      const data = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
      };

      const question_response = await axios
        .post('https://api.openai.com/v1/chat/completions', data, {
          headers: headers,
        })
        .then((response) => {
          return response.data?.choices?.[0].message;
        });
      console.log('dfsdfdg');
      console.log('response', typeof question_response);
      if (!question_response) {
        throw new HttpException(
          'Failed to generate questions',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log(question_response, 'Dss');
      let cleanedContent = question_response.content;
      // if (
      //   cleanedContent.match(/^\s*1\.\s*\{\s*\}/) ||
      //   cleanedContent.match(/^\s*2\.\s*\{\s*\}/)
      // ) {
      //   cleanedContent = cleanedContent.replace(/^\s*(1\.|2\.)\s*\{\s*\}/, '');
      // }
      // const contentArray = cleanedContent.split(/}\s*[,]{0,1}\n\s*{/g);
      // console.log(contentArray, 'dsds');
      // console.log(JSON.parse(cleanedContent), 'dsdjs');
      let questionsArrayFailed = false;
      let questionArray;

      try {
        questionArray = JSON.parse(cleanedContent);
      } catch (error) {
        console.error('Error parsing cleanedContent:', error);
        questionsArrayFailed = true;
      }
      // const questionsArrayfinal = questionArray.map((questionArray) => {
      //   try {
      //     const cleanedQuestionArray = questionArray.replace(/\n/g, '');
      //     return JSON.parse(cleanedQuestionArray);
      //   } catch (error) {
      //     console.error('Error parsing questionArray:', error);
      //     questionsArrayFailed = true;
      //   }
      // });

      if (!questionsArrayFailed) {
        const questionsData: Array<object> = questionArray.map((item) => ({
          id: v4(),
          question: item.question,
          type: 'MCQ',
          options: item.options,
          answer: item.answer,
        }));

        console.log(questionsData, 'sfdf');
        // console.log(Array.isArray(questionsData));

        const questionsfinal = await this.questionModel.create({
          skill: request.body.skill,
          level: request.body.level,
          questionMcq: JSON.stringify(questionsData),
        });

        const exam = await this.examModel.create({
          skill: request.body.skill,
          level: request.body.level,
          questionId: String(questionsfinal._id),
          userId: userId,
        });

        return {
          status: true,
          data: { examId: exam._id, question: questionsfinal },
          message: 'success',
        };
      } else {
        const findQuestion = await this.questionModel.aggregate([
          {
            $match: {
              skill: request.body.skill,
              level: request.body.level,
              questionMcq: { $elemMatch: { $exists: true, $ne: [] } },
            },
          },
          {
            $sample: { size: 1 },
          },
        ]);

        if (findQuestion && findQuestion.length > 0) {
          const questionsfinal = await this.questionModel.create({
            skill: request.body.skill,
            level: request.body.level,
            questionMcq: findQuestion[0].questionMcq[0],
          });

          const exam = await this.examModel.create({
            skill: request.body.skill,
            level: request.body.level,
            questionId: String(questionsfinal._id),
            userId: userId,
          });

          return {
            status: true,
            data: { examId: exam._id, question: questionsfinal },
            message: 'success',
          };
        } else {
          throw new HttpException(
            { message: 'Failed to generate Questions', status: false },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async answercheck(request: RequestWithUser) {
    try {
      const userId = request.userId;
      const candidate = await this.candidateModel.findOne({ userId }).exec();

      if (!candidate) {
        throw new NotFoundException('Invalid request');
      }

      //questionMcq : [{questionId , selectedOption}] , examId ,questionCoding : [{questionId , selectedOption}]

      const userAnswers = request.body.questionMcq;

      const exam = await this.examModel.findOne({ _id: request.body.examId });

      const questionTable = await this.questionModel.findOne({
        _id: exam.questionId,
      });

      const correctAnswers = JSON.parse(questionTable.questionMcq[0] as any);
      console.log(correctAnswers, 'dsddd');
      let totalScore = 0;

      userAnswers.forEach((userAnswer) => {
        const correctAnswer = correctAnswers.find(
          (answer) => answer.id === userAnswer.questionId,
        );
        if (
          correctAnswer &&
          correctAnswer.answer === userAnswer.selectedOption
        ) {
          totalScore += 5;
        }
      });

      const percentage = (totalScore / 50) * 100;
      console.log('Total Score:', totalScore);

      exam.finalMarks = totalScore;

      await exam.save();

      return {
        status: true,
        data: {
          percentage: percentage,
          obtainedMarks: totalScore,
          totalMarks: 50,
        },
        message: 'success',
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async answercheckcoding(request: RequestWithUser) {
    try {
      const userId = request.userId;
      const candidate = await this.candidateModel.findOne({ userId }).exec();

      if (!candidate) {
        throw new NotFoundException('Invalid request');
      }

      //questionMcq : [{questionId , selectedOption}] , examId ,questionCoding : [{questionId , selectedOption}]

      const userAnswers = request.body.questionCoding;

      const exam = await this.examModel.findOne({ _id: request.body.examId });

      const questionTable = await this.questionModel.findOne({
        _id: exam.questionId,
      });

      const correctAnswers = JSON.parse(questionTable.questionCoding[0] as any);
      console.log(correctAnswers, 'dsddd');
      let totalScore = 0;

      userAnswers.forEach(async (userAnswer) => {
        try {
          const response = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions',
            {
              source_code: userAnswer.sourceCode,
              language_id: request.body.languageId,
              stdin: userAnswer.input,
              expected_output: userAnswer.output,
            },
            {
              headers: {
                'X-RapidAPI-Key':
                  'cefbc651ffmsh40bb0052dc50134p135deajsn00ca4dedc904',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json',
              },
            },
          );

          const token = response.data.token;

          // Now make a GET request to the second API
          const secondApiResponse = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                'X-RapidAPI-Key':
                  'cefbc651ffmsh40bb0052dc50134p135deajsn00ca4dedc904',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json',
              },
            },
          );

          // Process the second API response as needed
          if (secondApiResponse.data.status.description == 'Accepted') {
            totalScore += 25;
          }
        } catch (error) {}
      });

      exam.finalMarks = Number(exam.finalMarks) + Number(totalScore);

      const percentage =
        ((Number(exam.finalMarks) + Number(totalScore)) / 100) * 100;

      if (percentage >= 50) {
        exam.result = Result.Pass;
      } else {
        exam.result = Result.Fail;
      }
      await exam.save();

      const updatedResult = await this.examModel.findOne({
        _id: request.body.examId,
      });

      return {
        status: true,
        data: {
          percentage: percentage,
          result: updatedResult,
        },
        message: 'success',
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async previousassessment(request: RequestWithUser) {
    try {
      const userId = request.userId;
      const candidate = await this.candidateModel.findOne({ userId }).exec();
       console.log(candidate,"dsd")
      if (!candidate) {
        throw new NotFoundException('Invalid request');
      }

      const exam = await this.examModel.find({ userId: userId });

      return {
        status: true,
        data: {
          assessments: exam,
        },
        message: 'success',
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
