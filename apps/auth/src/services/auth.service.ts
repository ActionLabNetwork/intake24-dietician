import * as argon2 from 'argon2';
import User from '@intake24-dietician/db/models/auth/user.model';

export class AuthService {
  public static async register(email: string, password: string): Promise<User> {
    const hashedPassword = await argon2.hash(password);
    return User.create({ email, password: hashedPassword });
  }

  public static async login(email: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    console.log({ user });
    if (user && (await argon2.verify(user.password, password))) {
      return user;
    }
    return null;
  }
}
