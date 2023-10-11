export type CreateUserOutputModel = {
  id: string
  login: string
  email: string
  createdAt: string
  banInfo: {
    banDate: string | null
    banReason: string | null
    isBanned: boolean
  }
}

export type UsersView = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CreateUserOutputModel[];
}