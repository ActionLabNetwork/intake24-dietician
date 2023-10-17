// import { Op } from 'sequelize'
// import Token from '@intake24-dietician/db/src/models/auth/token.model'

// export const deleteExpiredTokens = async () => {
//   try {
//     const result = await Token.destroy({
//       where: {
//         expiresAt: {
//           [Op.lt]: new Date() as any,
//         },
//       },
//     })
//     console.log(`Deleted ${result} expired tokens`)
//   } catch (error) {
//     console.error('Error deleting expired tokens:', error)
//   }
// }
