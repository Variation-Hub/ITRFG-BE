export interface ResponseModel<T> {
  status: boolean;
  data?: T;
  message: string;
}
