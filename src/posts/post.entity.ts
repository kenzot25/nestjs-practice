import Category from 'src/categories/category.entity';
import User from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('post')
export default class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  // @Column({ nullable: true })
  // // Transform is unnecessary due to Exclude Null interceptor have been used -> It's auto apply for every property
  // // @Transform(({ value }) => {
  // //   if (value !== null) {
  // //     return value;
  // //   }
  // // })
  // public category?: string;

  @ManyToOne(() => User, (author) => author.posts)
  public author: User;

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable()
  public categories: Category[];
}
