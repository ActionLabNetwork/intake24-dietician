/**
 * This file defines interfaces for repositories that interact with the database.
 * It exports interfaces for base repository, user repository, token repository, dietician profile repository and role repository.
 * The interfaces define methods for creating, finding, updating and deleting data from the database.
 * The interfaces also define the types of data that can be passed to these methods.
 */
export interface IEntity {
  [key: string]: any
}

export interface IBaseRepository<
  TAttributes extends IEntity,
  TCreationAttributes extends IEntity,
> {
  createOne: (
    data: TCreationAttributes & Partial<TAttributes>,
    options?: { transaction?: any; include?: any },
  ) => Promise<TAttributes>
  findOne: (
    params: Partial<TAttributes>,
    options?: { transaction?: any; include?: any; paranoid?: boolean },
    paranoid?: boolean,
  ) => Promise<TAttributes | undefined>
  findMany: (options: {
    limit: number
    offset: number
  }) => Promise<TAttributes[]>
  updateOne: (
    where: Partial<TAttributes>,
    data: Partial<TAttributes>,
    options?: { transaction: any },
  ) => Promise<TAttributes | undefined>
  destroyOne: (
    where: Partial<TAttributes>,
    options?: { transaction: any },
  ) => Promise<boolean>
}
