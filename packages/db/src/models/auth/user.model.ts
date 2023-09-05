import { Table, Column, Model, PrimaryKey, AutoIncrement, Unique, IsEmail } from 'sequelize-typescript';

@Table
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  public declare id: number;

  @Unique
  @IsEmail
  @Column
  public email!: string;

  @Column
  public password!: string;
}

export default User;
