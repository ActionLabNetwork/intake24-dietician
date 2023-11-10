import type { Includeable, Transaction, WhereOptions } from 'sequelize'
import type { Model, ModelCtor } from 'sequelize-typescript'
import type { MakeNullishOptional } from 'sequelize/types/utils'
import type {
  IBaseRepository,
  IEntity,
} from '@intake24-dietician/db/types/repositories'

export const createBaseRepository = <
  TAttributes extends IEntity,
  TCreationAttributes extends Partial<IEntity>,
  TModel extends Model<TAttributes, TCreationAttributes>,
>(
  Model: ModelCtor<TModel>,
): IBaseRepository<TAttributes, TCreationAttributes> => {
  const createOne = async (
    data: TCreationAttributes,
    options?: {
      transaction?: Transaction
      include?: Includeable | Includeable[]
    },
  ): Promise<TAttributes> => {
    const { transaction, include } = options || {}
    const createdModel = await Model.create(
      data as MakeNullishOptional<TModel['_creationAttributes']>,
      {
        ...(transaction ? { transaction } : {}),
        ...(include ? { include } : {}),
      },
    )
    return createdModel.get({ plain: true })
  }

  const findOne = async (
    params: Partial<TAttributes>,
    options?: {
      transaction?: Transaction
      include?: Includeable | Includeable[]
    },
  ): Promise<TAttributes | undefined> => {
    const { transaction, include } = options || {}
    const foundModel = await Model.findOne({
      where: params as unknown as WhereOptions<TAttributes>,
      ...(transaction ? { transaction } : {}),
      ...(include ? { include } : {}),
    })
    return foundModel?.get({ plain: true })
  }

  const updateOne = async (
    where: Partial<TAttributes>,
    data: Partial<TAttributes>,
    options?: { transaction?: Transaction },
  ): Promise<TAttributes | undefined> => {
    const { transaction } = options || {}
    const updatedModel = await Model.update(data, {
      where: where as unknown as WhereOptions<TAttributes>,
      returning: true,
      ...(transaction ? { transaction } : {}),
    })

    return updatedModel[1][0]?.get({ plain: true })
  }

  const destroyOne = async (
    where: Partial<TAttributes>,
    options?: { transaction?: Transaction },
  ): Promise<boolean> => {
    const { transaction } = options || {}
    const rowsAffected = await Model.destroy({
      where: where as unknown as WhereOptions<TAttributes>,
      ...(transaction ? { transaction } : {}),
    })
    return rowsAffected > 0
  }

  return { createOne, findOne, updateOne, destroyOne }
}
