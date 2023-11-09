import type { Transaction, WhereOptions } from 'sequelize'
import type { Model, ModelCtor } from 'sequelize-typescript'
import type { MakeNullishOptional } from 'sequelize/types/utils'

export interface IEntity {
  [key: string]: any
}

interface IBaseRepository<
  TAttributes extends IEntity,
  TCreationAttributes extends IEntity,
> {
  createOne: (
    data: TCreationAttributes,
    options?: { transaction: any },
  ) => Promise<TAttributes>
  findOne: (
    params: Partial<TAttributes>,
    options?: { transaction: any },
  ) => Promise<TAttributes>
}

export const createBaseRepository = <
  TAttributes extends IEntity,
  TCreationAttributes extends Partial<IEntity>,
  TModel extends Model<TAttributes, TCreationAttributes>,
>(
  Model: ModelCtor<TModel>,
): IBaseRepository<TAttributes, TCreationAttributes> => {
  const createOne = async (
    data: TCreationAttributes,
    options?: { transaction?: Transaction },
  ): Promise<TAttributes> => {
    const { transaction } = options || {}
    const createdModel = await Model.create(
      data as MakeNullishOptional<TModel['_creationAttributes']>,
      { ...(transaction ? { transaction } : {}) },
    )
    return createdModel as unknown as TAttributes
  }

  const findOne = async (
    params: Partial<TAttributes>,
    options?: { transaction?: Transaction },
  ): Promise<TAttributes> => {
    const { transaction } = options || {}
    const foundModel = await Model.findOne({
      where: params as unknown as WhereOptions<TAttributes>,
      ...(transaction ? { transaction } : {}),
    })
    return foundModel as unknown as TAttributes
  }

  return { createOne, findOne }
}
