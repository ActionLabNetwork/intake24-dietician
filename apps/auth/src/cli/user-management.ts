import { connectPostgres } from '@intake24-dietician/db/connection'
import { createUserService } from '../services/user.service'
import { createAuthService } from '../services/auth.service'
import { Command } from 'commander'
import { match } from 'ts-pattern'
import chalk from 'chalk'
import columnify from 'columnify'
import { createArgonHashingService } from '../services/hashing.service'
import { createJwtTokenService } from '../services/token.service'
import { createEmailService } from '../services/email.service'
import { pick, crush, mapKeys, omit } from 'radash'
import User from '@intake24-dietician/db/models/auth/user.model'
import DieticianProfile from '@intake24-dietician/db/models/auth/dietician-profile.model'

const authService = createAuthService(
  createArgonHashingService(),
  createJwtTokenService(),
  createEmailService(),
  createUserService(),
)
const userService = createUserService()

const program = new Command()

program.version('1.0.0')

program
  .command('create-user <email> <password>')
  .description('Create a new user')
  .action(async (email: string, password: string) => {
    const user = await authService.register(email, password)

    match(user)
      .with({ ok: true }, user => {
        console.log('User created successfully:', user.value?.email)
      })
      .with({ ok: false }, result => {
        console.log('User creation failed', result.error)
      })
      .exhaustive()

    process.exit()
  })

program
  .command('list-users')
  .option('-l, --limit <limit>', 'Number of users to display per page', '10')
  .option('-o, --offset <offset>', 'Offset for pagination', '0')
  .description('List users with pagination')
  .action(async options => {
    const defaultLimit = 10
    const defaultOffset = 0

    const { limit, offset } = options
    const users = await userService.listUsers(
      parseInt(limit ?? defaultLimit, 10),
      parseInt(offset ?? defaultOffset, 10),
    )

    match(users)
      .with({ ok: true }, users => {
        console.log(chalk.bold.blue('----- Users List -----'))

        if (users.value.length === 0) {
          console.log(chalk.yellow('No users found.'))
          return
        }

        const formatted = users.value.map(user => {
          return {
            id: user.id,
            email: user.email,
            verified: user.isVerified ? chalk.green('Yes') : chalk.red('No'),
          }
        })

        console.log(columnify(formatted, { showHeaders: true }))
      })
      .with({ ok: false }, result => {
        console.log(chalk.bold.red('Error listing users'))
        console.log(chalk.red(result.error))
      })
      .exhaustive()
    process.exit()
  })

program
  .command('get-user')
  .option('--id <id>', 'User ID in database')
  .option('-e, --email <email>', 'Email address in database')
  .description('Get user from database according to ID or Email')
  .action(async options => {
    const { id, email } = options

    if (id && email) {
      console.log(chalk.red('Please specify either ID or Email'))
      process.exit()
    }

    const getFormattedUser = async (user: User) => {
      const formatted = mapKeys(
        crush({
          ...pick(user.dataValues, ['id', 'email', 'isVerified']),
          dieticianProfile: pick(user.dataValues.dieticianProfile.dataValues, [
            'firstName',
            'middleName',
            'lastName',
            'mobileNumber',
            'businessNumber',
            'businessAddress',
          ]),
        }) as Record<string, unknown>,
        (key: string) => key.replace('dieticianProfile.', ''),
      )

      return formatted
    }

    if (id) {
      const user = await userService.getUserById(id)

      match(user)
        .with({ ok: true }, async user => {
          if (!user.value) {
            console.log(chalk.bold.red('Error getting user'))
            console.log(chalk.red('User not found'))
            return
          }

          console.log(columnify(await getFormattedUser(user.value)))
        })
        .with({ ok: false }, result => {
          console.log('Failed to get user', result.error)
        })
        .exhaustive()
    }

    if (email) {
      const user = await userService.getUserByEmail(email)

      match(user)
        .with({ ok: true }, async user => {
          if (!user.value) {
            console.log(chalk.bold.red('Error getting user'))
            console.log(chalk.red('User not found'))
            return
          }

          console.log(columnify(await getFormattedUser(user.value)))
        })
        .with({ ok: false }, result => {
          console.log('Failed to get user', result.error)
        })
        .exhaustive()

      return
    }
    process.exit()
  })

program
  .command('update-dietician-profile')
  .requiredOption('--id <id>', 'User ID in database')
  .option('--email <email>', 'User email in database')
  .option('--firstName <firstName>', 'User first name in database')
  .option('--middleName <middleName>', 'User middle name in database')
  .option('--lastName <lastName>', 'User last name in database')
  .option('--mobileNumber <mobileNumber>', 'User mobile number in database')
  .option(
    '--businessNumber <businessNumber>',
    'User business number in database',
  )
  .option(
    '--businessAddress <businessAddress>',
    'User business address in database',
  )
  .option('--shortBio <shortBio>', 'User short bio in database')
  .option('--avatar <avatar>', 'User avatar in database')
  .action(async options => {
    const dieticianProfile = options
    const updatedProfile = await userService.updateProfile(
      dieticianProfile.id,
      omit(dieticianProfile, [
        'id',
        'email',
      ]) satisfies Partial<DieticianProfile>,
    )

    match(updatedProfile)
      .with({ ok: true }, () => {
        console.log(chalk.bold.green('Dietician profile updated successfully'))
      })
      .with({ ok: false }, result => {
        console.log(
          chalk.bold.red('Error updating dietician profile', result.error),
        )
      })
      .exhaustive()
  })

program
  .command('delete-user')
  .option('--id <id>', 'User ID in database')
  .option('-e, --email <email>', 'Email address in database')
  .description('Soft-delete user from database according to ID or Email')
  .action(async options => {
    const { id, email } = options

    if (id && email) {
      console.log(chalk.red('Please specify either ID or Email'))
      process.exit()
    }

    if (id) {
      const user = await userService.deleteUserByIdOrEmail(id)

      match(user)
        .with({ ok: true }, async result => {
          console.log(`${result.value} rows was soft-deleted`)
        })
        .with({ ok: false }, result => {
          console.log('Failed to delete user', result.error)
        })
        .exhaustive()
    }

    if (email) {
      const user = await userService.deleteUserByIdOrEmail(email)

      match(user)
        .with({ ok: true }, async result => {
          console.log(`${result.value} rows was soft-deleted`)
        })
        .with({ ok: false }, result => {
          console.log('Failed to delete user', result.error)
        })
        .exhaustive()

      return
    }
    process.exit()
  })

program
  .command('restore-user')
  .option('--id <id>', 'User ID in database')
  .option('-e, --email <email>', 'Email address in database')
  .description(
    'Restore soft-deleted user from database according to ID or Email',
  )
  .action(async options => {
    const { id, email } = options

    if (id && email) {
      console.log(chalk.red('Please specify either ID or Email'))
      process.exit()
    }

    if (id) {
      const user = await userService.restoreDeletedUserByIdOrEmail(id)

      match(user)
        .with({ ok: true }, async () => {
          console.log('User has been restored if it was deleted')
        })
        .with({ ok: false }, result => {
          console.log('Failed to restore user', result.error)
        })
        .exhaustive()
    }

    if (email) {
      const user = await userService.restoreDeletedUserByIdOrEmail(email)

      match(user)
        .with({ ok: true }, async () => {
          console.log('User has been restored if it was deleted')
        })
        .with({ ok: false }, result => {
          console.log('Failed to restore user', result.error)
        })
        .exhaustive()

      return
    }
    process.exit()
  })

program
  .command('create-role <name>')
  .description('Create a new role')
  .action(async name => {
    const user = await userService.createRole(name)

    match(user)
      .with({ ok: true }, () => {
        console.log('Role created successfully:', name)
      })
      .with({ ok: false }, result => {
        console.log('User creation failed', result.error)
      })
      .exhaustive()

    process.exit()
  })

program
  .command('delete-role <name>')
  .description('Delete a role')
  .action(async name => {
    const user = await userService.deleteRole(name)

    match(user)
      .with({ ok: true }, result => {
        console.log(`${result.value} row(s) was deleted`)
      })
      .with({ ok: false }, result => {
        console.log('User deletion failed', result.error)
      })
      .exhaustive()

    process.exit()
  })

program
  .command('assign-role <userId> <roleName>')
  .description('Assign a role to a user')
  .action(async (userId: number, roleName: string) => {
    const user = await userService.assignRoleToUserById(userId, roleName)

    match(user)
      .with({ ok: true }, () => {
        console.log(`Role ${roleName} was assigned to user ${userId}`)
      })
      .with({ ok: false }, result => {
        console.log('Failed to assign role to user', result.error)
      })
      .exhaustive()

    process.exit()
  })

program
  .command('assign-patient <dieticianUserId> <patientUserId>')
  .description('Assign a patient to a dietician')
  .action(async (dieticianUserId: number, patientUserId: number) => {
    const user = await userService.assignPatientToDieticianById(
      dieticianUserId,
      patientUserId,
    )

    match(user)
      .with({ ok: true }, () => {})
      .with({ ok: false }, result => {
        console.log('Failed to assign patient to dietician', result.error)
      })
      .exhaustive()

    process.exit()
  })

program
  .command('get-patients <dieticianUserId>')
  .description('Get patients of a dietician')
  .action(async (dieticianUserId: number) => {
    await userService.getPatientsOfDietician(dieticianUserId)

    // match(user)
    //   .with({ ok: true }, () => {})
    //   .with({ ok: false }, result => {
    //     console.log('Failed to assign patient to dietician', result.error)
    //   })
    //   .exhaustive()

    process.exit()
  })

connectPostgres().then(() => {
  program.parse(process.argv)
})
