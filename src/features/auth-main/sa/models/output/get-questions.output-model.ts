import { IInsertQuestionOutputModel } from "./insert-question.output-model"

export interface IQuestionsOutputModel {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: IInsertQuestionOutputModel[]
}