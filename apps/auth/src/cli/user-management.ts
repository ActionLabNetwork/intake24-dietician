import { connectPostgres } from '@intake24-dietician/db/connection'
import { listUsers } from '../services/user.service'
import { createAuthService } from '../services/auth.service'
import { Command } from 'commander'
import { match } from 'ts-pattern'
import chalk from 'chalk'
import columnify from 'columnify'
import { createArgonHashingService } from '../services/hashing.service'
import { createJwtTokenService } from '../services/token.service'
import { createEmailService } from '../services/email.service'

const authService = createAuthService(
  createArgonHashingService(),
  createJwtTokenService(),
  createEmailService(),
)
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
  .action(async (_, options) => {
    const defaultLimit = 10
    const defaultOffset = 0

    const { limit, offset } = options
    const users = await listUsers(
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
  })

connectPostgres().then(() => {
  program.parse(process.argv)
})
