import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post')
export default class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @Column({ nullable: true })
  // Transform is unnecessary due to Exclude Null interceptor have been used -> It's auto apply for every property
  // @Transform(({ value }) => {
  //   if (value !== null) {
  //     return value;
  //   }
  // })
  public category?: string;
}
