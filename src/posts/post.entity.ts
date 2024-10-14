import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post')
export default class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;
}
